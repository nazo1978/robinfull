using System;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using ShopApp.Application;
using ShopApp.Core.CrossCuttingConcerns.Exceptions;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Extensions;
using ShopApp.Core.Security.JWT;
using ShopApp.Persistence;
using ShopApp.WebApi.Hubs;
using ShopApp.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplicationServices();
builder.Services.AddPersistenceServices(builder.Configuration);

// Add AutoMapper
builder.Services.AddAutoMapper(Assembly.GetExecutingAssembly(),
    typeof(ShopApp.Application.ServiceRegistration).Assembly);

// Add Exception Handling
builder.Services.AddExceptionHandling();

// Add JWT Authentication
var tokenOptions = builder.Configuration.GetSection("TokenOptions").Get<TokenOptions>();
if (tokenOptions == null)
{
    throw new InvalidOperationException("TokenOptions configuration is missing");
}

builder.Services.AddSingleton<IJwtHelper, JwtHelper>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidIssuer = tokenOptions.Issuer,
            ValidAudience = tokenOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenOptions.SecurityKey))
        };
    });

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Configure global exception middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Configure custom exception middleware
app.ConfigureCustomExceptionMiddleware();

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<AuctionHub>("/auctionHub");

app.Run();
