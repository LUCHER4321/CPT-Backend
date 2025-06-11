export const nullableInput = <I,O>(i: I | null | undefined, fun: (i: I) => O): (O | undefined) => i ? fun(i) : undefined;

export const nullableInputCanBeNull = <I,O>(i: I | null | undefined, fun: (i: I) => O): (O | undefined | null) => i === null ? null : i ? fun(i) : undefined;