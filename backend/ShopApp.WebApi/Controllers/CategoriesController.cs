using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Commands.CreateCategory;
using ShopApp.Application.Commands.UpdateCategory;
using ShopApp.Application.DTOs;
using ShopApp.Application.Queries.GetCategories;
using ShopApp.Application.Queries.GetCategoryById;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<CategoryDto>>> GetAll()
    {
        return await _mediator.Send(new GetCategoriesQuery());
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CategoryDto>> GetById(Guid id)
    {
        var category = await _mediator.Send(new GetCategoryByIdQuery(id));

        if (category == null)
        {
            return NotFound();
        }

        return category;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryCommand command)
    {
        var category = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CategoryDto>> Update(Guid id, UpdateCategoryCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new { message = "ID mismatch", success = false });
        }

        try
        {
            var category = await _mediator.Send(command);
            return Ok(category);
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message, success = false });
        }
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult> Delete(Guid id)
    {
        try
        {
            // Basit silme işlemi - ileride DeleteCategoryCommand eklenebilir
            // Şimdilik sadece 404 döndürelim
            return NotFound("Delete operation not implemented yet");
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }
}