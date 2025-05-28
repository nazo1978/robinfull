using System;
using Serilog;

namespace ShopApp.Core.CrossCuttingConcerns.Logging.Serilog;

public abstract class LoggerServiceBase : ILoggerService
{
    protected ILogger Logger { get; set; } = null!;

    public void Verbose(string message) => Logger.Verbose(message);
    public void Fatal(string message) => Logger.Fatal(message);
    public void Info(string message) => Logger.Information(message);
    public void Warning(string message) => Logger.Warning(message);
    public void Debug(string message) => Logger.Debug(message);
    public void Error(string message) => Logger.Error(message);

    public void Error(LogDetail logDetail)
    {
        Logger.Error(
            "Error: {MethodName} - {User} - {ExceptionMessage}",
            logDetail.MethodName,
            logDetail.User,
            logDetail.ExceptionMessage
        );
    }
}
