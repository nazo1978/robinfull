using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Commands.CreateSiteSetting;
using ShopApp.Application.Commands.UpdateSiteSetting;
using ShopApp.Application.DTOs;
using ShopApp.Application.Queries.GetSiteSettings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ShopApp.WebApi.Controllers;

public class UpdateSectionVisibilityRequest
{
    public Dictionary<string, bool> Sections { get; set; } = new();
}

public class SectionSetting
{
    public string Key { get; set; } = string.Empty;
    public bool Value { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class SiteSettingsController : BaseController
{
    private readonly IMediator _mediator;

    public SiteSettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<SiteSettingDto>>> GetSiteSettings([FromQuery] GetSiteSettingsQuery query)
    {
        try
        {
            // Public ayarlar için authentication gerekmez
            if (query.IsPublic == true)
            {
                var publicSettings = await _mediator.Send(query);
                return Ok(publicSettings);
            }

            // Private ayarlar için admin yetkisi gerekir
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var settings = await _mediator.Send(query);
            return Ok(settings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpGet("sections")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<object>> GetSectionVisibility()
    {
        try
        {
            var query = new GetSiteSettingsQuery { Category = "sections", IsPublic = true };
            var settings = await _mediator.Send(query);

            // Default section visibility
            var sectionVisibility = new
            {
                featuredProducts = true,
                dynamicBanners = false,
                dynamicPricing = false,
                lotterySection = false,
                exchangeSection = false,
                auctionSection = false,
                categories = true
            };

            // Override with database settings if they exist
            var result = new Dictionary<string, object>();
            foreach (var prop in sectionVisibility.GetType().GetProperties())
            {
                var setting = settings.Find(s => s.Key == prop.Name);
                if (setting != null && bool.TryParse(setting.Value, out bool value))
                {
                    result[prop.Name] = value;
                }
                else
                {
                    result[prop.Name] = prop.GetValue(sectionVisibility);
                }
            }

            return Ok(new { success = true, sections = result });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPost]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<SiteSettingDto>> CreateSiteSetting(CreateSiteSettingCommand command)
    {
        try
        {
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            var setting = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetSiteSettings), new { key = setting.Key }, setting);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPut("sections")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult> UpdateSectionVisibility([FromBody] UpdateSectionVisibilityRequest request)
    {
        try
        {
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            // Her section için ayrı ayrı setting oluştur/güncelle
            foreach (var section in request.Sections)
            {
                var existingQuery = new GetSiteSettingsQuery
                {
                    Key = section.Key,
                    Category = "sections"
                };
                var existingSettings = await _mediator.Send(existingQuery);
                var existingSetting = existingSettings.FirstOrDefault();

                if (existingSetting != null)
                {
                    // Güncelle
                    var updateCommand = new UpdateSiteSettingCommand
                    {
                        Id = existingSetting.Id,
                        Key = section.Key,
                        Value = section.Value.ToString().ToLower(),
                        Category = "sections",
                        DataType = "boolean",
                        IsPublic = true,
                        Description = $"{section.Key} bölümünün görünürlük ayarı"
                    };
                    await _mediator.Send(updateCommand);
                }
                else
                {
                    // Yeni oluştur
                    var createCommand = new CreateSiteSettingCommand
                    {
                        Key = section.Key,
                        Value = section.Value.ToString().ToLower(),
                        Category = "sections",
                        DataType = "boolean",
                        IsPublic = true,
                        Description = $"{section.Key} bölümünün görünürlük ayarı"
                    };
                    await _mediator.Send(createCommand);
                }
            }

            return Ok(new { success = true, message = "Site ayarları başarıyla güncellendi" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SiteSettingDto>> UpdateSiteSetting(Guid id, UpdateSiteSettingCommand command)
    {
        try
        {
            if (!IsAdmin())
            {
                return Forbid("Bu işlem için admin yetkisi gereklidir");
            }

            command.Id = id;
            var setting = await _mediator.Send(command);
            return Ok(setting);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }
}
