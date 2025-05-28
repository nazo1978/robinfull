using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.DeleteKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.UpdateKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Queries.GetByIdKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Queries.GetListKurumsalMusteri;
using ShopApp.Core.Pagination;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KurumsalMusterilerController : ControllerBase
{
    private readonly IMediator _mediator;

    public KurumsalMusterilerController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResult<GetListKurumsalMusteriResponse>>> GetAll([FromQuery] GetListKurumsalMusteriQuery query)
    {
        return await _mediator.Send(query);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<GetByIdKurumsalMusteriResponse>> GetById(Guid id)
    {
        var response = await _mediator.Send(new GetByIdKurumsalMusteriQuery { Id = id });
        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CreateKurumsalMusteriResponse>> Create(CreateKurumsalMusteriCommand command)
    {
        var response = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UpdateKurumsalMusteriResponse>> Update(Guid id, UpdateKurumsalMusteriCommand command)
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
    public async Task<ActionResult<DeleteKurumsalMusteriResponse>> Delete(Guid id)
    {
        var response = await _mediator.Send(new DeleteKurumsalMusteriCommand { Id = id });
        return Ok(response);
    }
}
