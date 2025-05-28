using AutoMapper;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.CreateKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.DeleteKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Commands.UpdateKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Queries.GetByIdKurumsalMusteri;
using ShopApp.Application.Features.KurumsalMusteriler.Queries.GetListKurumsalMusteri;
using ShopApp.Domain.Entities;

namespace ShopApp.Application.Features.KurumsalMusteriler.Profiles;

public class KurumsalMusteriMappingProfile : Profile
{
    public KurumsalMusteriMappingProfile()
    {
        // Commands
        CreateMap<CreateKurumsalMusteriCommand, KurumsalMusteri>();
        CreateMap<KurumsalMusteri, CreateKurumsalMusteriResponse>();
        
        CreateMap<UpdateKurumsalMusteriCommand, KurumsalMusteri>();
        CreateMap<KurumsalMusteri, UpdateKurumsalMusteriResponse>();
        
        CreateMap<KurumsalMusteri, DeleteKurumsalMusteriResponse>()
            .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => true));
        
        // Queries
        CreateMap<KurumsalMusteri, GetByIdKurumsalMusteriResponse>();
        CreateMap<KurumsalMusteri, GetListKurumsalMusteriResponse>();
    }
}
