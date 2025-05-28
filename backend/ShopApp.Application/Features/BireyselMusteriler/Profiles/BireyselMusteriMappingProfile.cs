using AutoMapper;
using ShopApp.Application.Features.BireyselMusteriler.Commands.CreateBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Commands.DeleteBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Commands.UpdateBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Queries.GetByIdBireyselMusteri;
using ShopApp.Application.Features.BireyselMusteriler.Queries.GetListBireyselMusteri;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.BireyselMusteriler.Profiles;

public class BireyselMusteriMappingProfile : Profile
{
    public BireyselMusteriMappingProfile()
    {
        // Commands
        CreateMap<CreateBireyselMusteriCommand, BireyselMusteri>();
        CreateMap<BireyselMusteri, CreateBireyselMusteriResponse>();
        
        CreateMap<UpdateBireyselMusteriCommand, BireyselMusteri>();
        CreateMap<BireyselMusteri, UpdateBireyselMusteriResponse>();
        
        CreateMap<BireyselMusteri, DeleteBireyselMusteriResponse>()
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => true));
        
        // Queries
        CreateMap<BireyselMusteri, GetByIdBireyselMusteriResponse>();
        CreateMap<BireyselMusteri, GetListBireyselMusteriResponse>();
    }
} 