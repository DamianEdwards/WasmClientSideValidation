using System;
using System.Runtime.InteropServices.JavaScript;

partial class ClientValidator
{
    public static void Main()
    {
    }

    [JSExport]
    internal static bool IsValid(string validator, JSObject args, string value)
    {
        var attribute = ValidationAttributeFactory.Create(validator, args);
        return attribute.IsValid(value);
    }
}
