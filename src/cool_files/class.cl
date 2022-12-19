class Valor {
  valor : Int <- 10;

  getValor(): Int {
    valor
  };
};


class Main inherits IO {
    main(): Object {
      let instance : Valor <- new Valor
      in {
        out_int(instance.getValor());
      }
    };
};
