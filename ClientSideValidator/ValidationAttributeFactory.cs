using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.InteropServices.JavaScript;

internal class ValidationAttributeFactory
{
    public static ValidationAttribute Create(string validator, JSObject args)
    {
        // Given a validator name and args, return an instance of the corresponding validation attribute.
        switch (validator)
        {
            case "required":
                return new RequiredAttribute();

            case "email":
                return new EmailAddressAttribute();

            case "range":
                // TODO: Handle double values as well
                return new RangeAttribute(
                    GetArgValue<int>(args, nameof(RangeAttribute.Minimum), required: true),
                    GetArgValue<int>(args, nameof(RangeAttribute.Maximum), required: true))
                {
                    MaximumIsExclusive = GetArgValue<bool>(args, nameof(RangeAttribute.MaximumIsExclusive)),
                    MinimumIsExclusive = GetArgValue<bool>(args, nameof(RangeAttribute.MinimumIsExclusive))
                };

            case "stringlength":
                return new StringLengthAttribute(GetArgValue<int>(args, nameof(StringLengthAttribute.MinimumLength), required: true))
                {
                    MinimumLength = GetArgValue<int>(args, nameof(StringLengthAttribute.MinimumLength))
                };

            // And so on...

            default:
                throw new ArgumentException($"Unknown validator: {validator}");
        }
    }

    private static T? GetArgValue<T>(JSObject args, string key, bool required = false)
    {
        if (args.TryGet<T>(key, out var argValue))
        {
            if (argValue is T typedValue)
            {
                return typedValue;
            }
            else
            {
                throw new ArgumentException($"Invalid value for argument {key}: {argValue}");
            }
        }
        else if (required)
        {
            throw new ArgumentException($"Missing value for required argument {key}");
        }

        return default;
    }

    private static (T1?, T2?) GetArgValue<T1, T2>(JSObject args, string key, bool required = false)
    {
        if (required)
        {
            if (!args.HasProperty(key))
            {
                throw new ArgumentException($"Missing value for required argument {key}");
            }
        }

        T1? value1 = GetArgValue<T1>(args, key);
        T2? value2 = GetArgValue<T2>(args, key);

        return (value1, value2);
    }
}

internal static class JSObjectExtensions
{
    public static bool TryGet<T>(this JSObject obj, string key, [NotNullWhen(true)] out T? value)
    {
        if (obj.HasProperty(key))
        {
            var propertyType = obj.GetTypeOfProperty(key);

            if (typeof(T) == typeof(int) && propertyType == "number")
            {
                value = (T)(object)obj.GetPropertyAsInt32(key);
                return true;
            }
            else if (typeof(T) == typeof(double) && propertyType == "number")
            {
                value = (T)(object)obj.GetPropertyAsDouble(key);
                return true;
            }
            else if (typeof(T) == typeof(string) && propertyType == "string")
            {
                value = (T)(object)obj.GetPropertyAsString(key)!;
                return true;
            }
            else if (typeof(T) == typeof(bool) && propertyType == "boolean")
            {
                value = (T)(object)obj.GetPropertyAsBoolean(key);
                return true;
            }
            else if (typeof(T) == typeof(JSObject) && propertyType == "object")
            {
                value = (T)(object)obj.GetPropertyAsJSObject(key)!;
                return true;
            }
            else
            {
                throw new InvalidOperationException($"Cannot get value for property '{key}' with JS type '{propertyType}' as a .NET '{typeof(T).Name}'.");
            }
        }

        value = default;
        return false;
    }
}