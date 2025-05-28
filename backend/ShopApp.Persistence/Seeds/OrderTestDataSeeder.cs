using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ShopApp.Domain.Entities;
using ShopApp.Persistence.Contexts;
using ShopApp.Core.Identity;

namespace ShopApp.Persistence.Seeds;

public static class OrderTestDataSeeder
{
    public static async Task SeedAsync(ShopAppDbContext context)
    {
        // Eğer zaten sipariş varsa, seed etme
        if (await context.Orders.AnyAsync())
        {
            return;
        }

        // Test kullanıcıları al (ApplicationUser'ları)
        var users = await context.Users.OfType<ApplicationUser>().Take(3).ToListAsync();
        if (!users.Any())
        {
            return;
        }

        // Test ürünleri al
        var products = await context.Products.Take(5).ToListAsync();
        if (!products.Any())
        {
            return;
        }

        var orders = new List<Order>();
        var random = new Random();

        // Her kullanıcı için 2-3 sipariş oluştur
        foreach (var user in users)
        {
            var orderCount = random.Next(2, 4);

            for (int i = 0; i < orderCount; i++)
            {
                var orderDate = DateTime.UtcNow.AddDays(-random.Next(1, 30));
                var orderNumber = $"ORD{orderDate:yyyyMMdd}{random.Next(1000, 9999)}";

                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    OrderNumber = orderNumber,
                    UserId = user.Id,
                    Status = GetRandomOrderStatus(random),
                    PaymentMethod = GetRandomPaymentMethod(random),
                    PaymentStatus = GetRandomPaymentStatus(random),
                    ShippingName = $"{user.FirstName} {user.LastName}",
                    ShippingAddress = GetRandomAddress(random),
                    ShippingCity = GetRandomCity(random),
                    ShippingPostalCode = random.Next(10000, 99999).ToString(),
                    ShippingCountry = "Türkiye",
                    ShippingPhone = $"555{random.Next(1000000, 9999999)}",
                    CreatedDate = orderDate,
                    Notes = i == 0 ? "İlk test siparişi" : null
                };

                // Sipariş öğeleri oluştur
                var itemCount = random.Next(1, 4);
                var selectedProducts = products.OrderBy(x => random.Next()).Take(itemCount).ToList();

                decimal itemsPrice = 0;

                foreach (var product in selectedProducts)
                {
                    var quantity = random.Next(1, 4);
                    var unitPrice = product.Price;
                    var discountRate = random.Next(0, 21); // 0-20% indirim
                    var originalTotal = unitPrice * quantity;
                    var discountAmount = originalTotal * discountRate / 100;
                    var totalPrice = originalTotal - discountAmount;

                    var orderItem = new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductDescription = product.Description,
                        ProductImage = null, // Product entity'sinde ImageUrl yok
                        Quantity = quantity,
                        UnitPrice = unitPrice,
                        DiscountRate = discountRate,
                        DiscountAmount = discountAmount,
                        OriginalTotalPrice = originalTotal,
                        TotalPrice = totalPrice,
                        CreatedDate = orderDate
                    };

                    order.OrderItems.Add(orderItem);
                    itemsPrice += totalPrice;
                }

                // Fiyat hesaplamaları
                order.ItemsPrice = itemsPrice;
                order.TaxPrice = itemsPrice * 0.18m; // %18 KDV
                order.ShippingPrice = itemsPrice > 500 ? 0 : 25; // 500 TL üzeri ücretsiz kargo
                order.TotalPrice = order.ItemsPrice + order.TaxPrice + order.ShippingPrice;

                // Sipariş durumuna göre tarihleri ayarla
                if (order.Status == OrderStatus.Shipped || order.Status == OrderStatus.Delivered)
                {
                    order.ShippedDate = orderDate.AddDays(random.Next(1, 3));
                }

                if (order.Status == OrderStatus.Delivered)
                {
                    order.DeliveredDate = order.ShippedDate?.AddDays(random.Next(1, 5));
                }

                if (order.PaymentStatus == PaymentStatus.Paid)
                {
                    order.PaymentDate = orderDate.AddHours(random.Next(1, 24));
                }

                orders.Add(order);
            }
        }

        await context.Orders.AddRangeAsync(orders);
        await context.SaveChangesAsync();
    }

    private static OrderStatus GetRandomOrderStatus(Random random)
    {
        var statuses = Enum.GetValues<OrderStatus>();
        return statuses[random.Next(statuses.Length)];
    }

    private static PaymentMethod GetRandomPaymentMethod(Random random)
    {
        var methods = Enum.GetValues<PaymentMethod>();
        return methods[random.Next(methods.Length)];
    }

    private static PaymentStatus GetRandomPaymentStatus(Random random)
    {
        var statuses = Enum.GetValues<PaymentStatus>();
        return statuses[random.Next(statuses.Length)];
    }

    private static string GetRandomAddress(Random random)
    {
        var streets = new[] { "Atatürk Caddesi", "İstiklal Caddesi", "Cumhuriyet Bulvarı", "Barbaros Bulvarı", "Bağdat Caddesi" };
        var street = streets[random.Next(streets.Length)];
        var number = random.Next(1, 200);
        var apartment = random.Next(1, 50);
        return $"{street} No:{number} Daire:{apartment}";
    }

    private static string GetRandomCity(Random random)
    {
        var cities = new[] { "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep" };
        return cities[random.Next(cities.Length)];
    }
}
