define(['library'], function(myLibrary) {
    describe("library", function() {
        describe("sayHello", function() {
            it("should say Hello", function() {
                expect(myLibrary.sayHello()).toEqual("Hello");
            });
        });
    });
});
