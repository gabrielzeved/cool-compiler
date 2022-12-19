class Valor {
  valor : Int <- 10;

  getValor(): Int {
    valor
  };
};


class Main inherits IO {
    main(): Object {
      let instance : Valor <- new Valor,
        i: Int <- 0
      in {
        while (i < instance.getValor()) loop {
			i <- i + 1;
            out_int(i);
          } pool;
      }
    };
};
