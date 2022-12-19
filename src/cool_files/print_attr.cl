class Main inherits IO {
    attr: Int <- 5;

    main(): Object {
      let value: Int <- 2
      in {
        out_int(value);
        out_int(attr);
      }
    };
};
