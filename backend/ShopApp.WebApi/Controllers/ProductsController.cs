using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ShopApp.Application.Commands.CreateProduct;
using ShopApp.Application.Commands.UpdateProduct;
using ShopApp.Application.DTOs;
using ShopApp.Application.Queries.GetProducts;

namespace ShopApp.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<ActionResult<List<ProductDto>>> GetAll()
    {
        return await _mediator.Send(new GetProductsQuery());
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> GetById(Guid id)
    {
        // Bu kısmı ileride GetProductByIdQuery ile değiştirebilirsiniz
        var products = await _mediator.Send(new GetProductsQuery());
        var product = products.Find(p => p.Id == id);

        if (product == null)
        {
            return NotFound();
        }

        return product;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> Create(CreateProductCommand command)
    {
        try
        {
            var product = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message, success = false });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductDto>> Update(Guid id, UpdateProductCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest(new { message = "ID mismatch", success = false });
        }

        try
        {
            var product = await _mediator.Send(command);
            return Ok(product);
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
            // Basit silme işlemi - ileride DeleteProductCommand eklenebilir
            // Şimdilik sadece 404 döndürelim
            return NotFound(new { message = "Delete operation not implemented yet", success = false });
        }
        catch (Exception ex)
        {
            return NotFound(new { message = ex.Message, success = false });
        }
    }
}