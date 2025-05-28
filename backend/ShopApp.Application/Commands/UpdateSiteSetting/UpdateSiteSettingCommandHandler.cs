using MediatR;
using Microsoft.EntityFrameworkCore;
using ShopApp.Application.DTOs;
using ShopApp.Application.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Commands.UpdateSiteSetting;

public class UpdateSiteSettingCommandHandler : IRequestHandler<UpdateSiteSettingCommand, SiteSettingDto>
{
    private readonly IApplicationDbContext _context;

    public UpdateSiteSettingCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<SiteSettingDto> Handle(UpdateSiteSettingCommand request, CancellationToken cancellationToken)
    {
        var setting = await _context.SiteSettings
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (setting == null)
        {
            throw new Exception("Site ayarı bulunamadı");
        }

        setting.Key = request.Key;
        setting.Value = request.Value;
        setting.Description = request.Description;
        setting.DataType = request.DataType;
        setting.Category = request.Category;
        setting.IsPublic = request.IsPublic;
        setting.ModifiedDate = DateTime.UtcNow;

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
