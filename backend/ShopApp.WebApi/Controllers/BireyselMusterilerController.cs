using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Commands.DeleteBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Commands.UpdateBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Queries.GetByIdBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Queries.GetListBireyselMusteri;
using ShopApp.Core.Pagination;
using ShopApp.Core.Security.Roles;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tüm controller için yetkilendirme gerektirir
public class BireyselMusterilerController : ControllerBase
{
    private readonly IMediator _mediator;

    public BireyselMusterilerController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [Authorize(Roles = Role.Admin)] // Sadece Admin rolü bu endpoint'e erişebilir
    public async Task<ActionResult<PaginatedResult<GetListBireyselMusteriResponse>>> GetAll([FromQuery] GetListBireyselMusteriQuery query)
    {
        return await _mediator.Send(query);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [Authorize(Roles = $"{Role.Admin},{Role.BireyselMusteri}")] // Admin ve BireyselMusteri rolleri erişebilir
    public async Task<ActionResult<GetByIdBireyselMusteriResponse>> GetById(Guid id)
    {
        var response = await _mediator.Send(new GetByIdBireyselMusteriQuery { Id = id });
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateBireyselMusteriResponse>> Create(CreateBireyselMusteriCommand command)
    {
        var response = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UpdateBireyselMusteriResponse>> Update(Guid id, UpdateBireyselMusteriCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID in the URL does not match the ID in the request body.");
        }

        var response = await _mediator.Send(command);
        return Ok(response);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<DeleteBireyselMusteriResponse>> Delete(Guid id)
    {
        var response = await _mediator.Send(new DeleteBireyselMusteriCommand { Id = id });
        return Ok(response);
    }
}
