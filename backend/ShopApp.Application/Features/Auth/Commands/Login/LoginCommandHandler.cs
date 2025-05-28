using MediatR;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Core.Security.Hashing;
using ShopApp.Core.Security.JWT;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtHelper _jwtHelper;

    public LoginCommandHandler(IUserRepository userRepository, IJwtHelper jwtHelper)
    {
        _userRepository = userRepository;
        _jwtHelper = jwtHelper;
    }

    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);

        if (user == null)
            throw new BusinessException("Email or password is incorrect");

        if (!HashingHelper.VerifyPasswordHash(request.Password, user.PasswordHash, user.PasswordSalt))
            throw new BusinessException("Password is incorrect");

        if (!user.IsActive)
            throw new BusinessException("User is not active");

        var token = _jwtHelper.CreateToken(user);

        return new LoginResponse
        {
            AccessToken = token,
            Username = user.Username,
            Email = user.Email
        };
    }
}
