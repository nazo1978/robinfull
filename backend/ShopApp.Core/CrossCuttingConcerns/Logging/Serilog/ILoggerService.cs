namespace ShopApp.Core.CrossCuttingConcerns.Logging.Serilog;

public interface ILoggerService
{
    void Verbose(string message);
    void Fatal(string message);
    void Info(string message);
    void Warning(string message);
    void Debug(string message);
    void Error(string message);
    void Error(LogDetail logDetail);
}
