using System;
using System.Runtime.InteropServices.JavaScript;

Console.WriteLine("Client validation initialized");

partial class ClientValidator
{
    [JSExport]
    internal static bool IsValid(string validator, JSObject args, string value)
    {
        var attribute = ValidationAttributeFactory.Create(validator, args);
        return attribute.IsValid(value);
    }
}
