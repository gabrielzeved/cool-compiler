class Test{
    test: Int <- 2;
    
    double() : Int {
        test * 2
    };
};

class Main inherits IO {
    main() : Object {
        let i: Int <- 6,
        	t: Int <- 11,
	        test: Test <- new Test
       	in {
            while i < 10 loop
            {
                if i = 7 then
                	out_int(test.double())
                else
                	out_int(2 * i)
                fi;
                i <- i + 1;
            }
            pool;
        }
    };
};