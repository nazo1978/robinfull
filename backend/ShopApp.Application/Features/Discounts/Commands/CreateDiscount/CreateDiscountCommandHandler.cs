using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.Interfaces;
using ShopApp.Application.Services.Repositories;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.Discounts.Commands.CreateDiscount;

public class CreateDiscountCommandHandler : IRequestHandler<CreateDiscountCommand, CreateDiscountResponse>
{
    private readonly IDiscountRepository _discountRepository;
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;

    public CreateDiscountCommandHandler(
        IDiscountRepository discountRepository,
        IApplicationDbContext dbContext,
        IMapper mapper)
    {
        _discountRepository = discountRepository;
        _dbContext = dbContext;
        _mapper = mapper;
    }

    public async Task<CreateDiscountResponse> Handle(CreateDiscountCommand request, CancellationToken cancellationToken)
    {
        // Ürün ve kategori kontrolü
        string productName = null;
        string categoryName = null;

        if (request.ProductId.HasValue)
        {
            var product = await _dbContext.Products.FindAsync(request.ProductId.Value);
            if (product == null)
                throw new Exception($"Ürün bulunamadı: {request.ProductId.Value}");
                
            productName = product.Name;
        }

        if (request.CategoryId.HasValue)
        {
            var category = await _dbContext.Categories.FindAsync(request.CategoryId.Value);
            if (category == null)
                throw new Exception($"Kategori bulunamadı: {request.CategoryId.Value}");
                
            categoryName = category.Name;
        }

        // İndirim oluştur
        var discount = new Discount
        {
            Name = request.Name,
            Description = request.Description,
            DiscountType = request.DiscountType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            MinimumPurchaseAmount = request.MinimumPurchaseAmount,
            ProductId = request.ProductId,
            CategoryId = request.CategoryId,
            IsActive = true
        };

        // İndirim kurallarını ekle
        foreach (var ruleDto in request.Rules)
        {
            var rule = new DiscountRule
            {
                MinimumQuantity = ruleDto.MinimumQuantity,
                DiscountRate = ruleDto.DiscountRate,
                DiscountAmount = ruleDto.DiscountAmount
            };
            
            discount.Rules.Add(rule);
        }

        // Veritabanına kaydet
        await _discountRepository.AddAsync(discount, cancellationToken);

        // Yanıt oluştur
        var response = _mapper.Map<CreateDiscountResponse>(discount);
        response.ProductName = productName;
        response.CategoryName = categoryName;
        
        return response;
    }
}
