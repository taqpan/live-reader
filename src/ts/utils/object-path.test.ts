import {
    resolveObjectPath,
} from "./object-path";

describe("object-path", () => {
    test("resolveObjectPath", () => {
        const obj: any = {
            foo: {
                bar: "abc",
            },
        };
        expect(resolveObjectPath(obj, "foo.bar"))
            .toBe("abc");
    });

    test("resolveObjectPath_notFound", () => {
        const obj: any = {
            foo: {
                bar: "abc",
            },
        };
        expect(resolveObjectPath(obj, "foo.fizz"))
            .toBe(undefined);
    });

    test("resolveObjectPath_empty", () => {
        const obj: any = {};
        expect(resolveObjectPath(obj, "foo"))
            .toBe(undefined);
    });

    test("resolveObjectPath_undefined", () => {
        const obj: any = undefined;
        expect(resolveObjectPath(obj, "foo"))
            .toBe(undefined);
    });
});
