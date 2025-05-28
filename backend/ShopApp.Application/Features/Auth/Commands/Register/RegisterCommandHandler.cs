using MediatR;
using ShopApp.Application.Interfaces;
using ShopApp.Core.CrossCuttingConcerns.Exceptions.Types;
using ShopApp.Core.Identity;
using ShopApp.Core.Security.Hashing;
using ShopApp.Core.Security.JWT;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace ShopApp.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, RegisterResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly IApplicationUserRepository _applicationUserRepository;
    private readonly IJwtHelper _jwtHelper;
    private readonly IApplicationDbContext _context;

    public RegisterCommandHandler(
        IUserRepository userRepository,
        IApplicationUserRepository applicationUserRepository,
        IJwtHelper jwtHelper,
        IApplicationDbContext context)
    {
        _userRepository = userRepository;
        _applicationUserRepository = applicationUserRepository;
        _jwtHelper = jwtHelper;
        _context = context;
    }

    public async Task<RegisterResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Check if username already exists
        var existingUser = await _userRepository.GetByUsernameAsync(request.Username, cancellationToken);
        if (existingUser != null)
            throw new BusinessException("Username already exists");

        // Check if email already exists
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (existingEmail != null)
            throw new BusinessException("Email already exists");

        // Create password hash
        HashingHelper.CreatePasswordHash(request.Password, out string passwordHash, out string passwordSalt);

        // Admin kullanıcısı kontrolü
        string userType = "User"; // Default user type

        // Admin email listesi
        var adminEmails = new[] {
            "admin@shopapp.com",
            "testadmin@shopapp.com",
            "admin1@shopapp.com",
            "superadmin@shopapp.com",
            "finaladmin@shopapp.com"
        };

        // Admin username listesi
        var adminUsernames = new[] {
            "admin",
            "testadmin",
            "admin1",
            "superadmin",
            "finaladmin"
        };

        if (adminEmails.Contains(request.Email.ToLower()) || adminUsernames.Contains(request.Username.ToLower()))
        {
            userType = "Admin";
        }

        // Create application user
        var applicationUser = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            EmailConfirmed = false,
            IsActive = true,
            IsDeleted = false,
            CreatedDate = DateTime.UtcNow,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address ?? "",
            UserType = userType,
            RegistrationDate = DateTime.UtcNow
        };

        // Save user to database
        await _applicationUserRepository.AddAsync(applicationUser);
        await _context.SaveChangesAsync(cancellationToken);

        // Generate token
        var token = _jwtHelper.CreateToken(applicationUser);

        return new RegisterResponse
        {
            AccessToken = token,
            Username = applicationUser.Username,
            Email = applicationUser.Email
        };
    }
}
