namespace ShopApp.Core.Application.Security;

public interface ISecuredRequest
{
    string[] Roles { get; }
}
