using MediatR;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using ShopApp.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.CreateSiteSetting;

public class CreateSiteSettingCommandHandler : IRequestHandler<CreateSiteSettingCommand, SiteSettingDto>
{
    private readonly IApplicationDbContext _context;

    public CreateSiteSettingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SiteSettingDto> Handle(CreateSiteSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = new SiteSetting
        {
            Id = Guid.NewGuid(),
            Key = request.Key,
            Value = request.Value,
            Description = request.Description,
            DataType = request.DataType,
            Category = request.Category,
            IsPublic = request.IsPublic,
            CreatedDate = DateTime.UtcNow
        };

        _context.SiteSettings.Add(setting);
        await _context.SaveChangesAsync(cancellationToken);

        return new SiteSettingDto
        {
            Id = setting.Id,
            Key = setting.Key,
            Value = setting.Value,
            Description = setting.Description,
            DataType = setting.DataType,
            Category = setting.Category,
            IsPublic = setting.IsPublic,
            CreatedDate = setting.CreatedDate,
            ModifiedDate = setting.ModifiedDate
        };
    }
}
