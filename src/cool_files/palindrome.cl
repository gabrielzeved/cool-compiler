class Main inherits IO {
    pal(s : String) : Bool {
	if s.length() = 0
	then true
	else if s.length() = 1
	then true
	else if s.substr(0, 1) = s.substr(s.length() - 1, 1)
	then pal(s.substr(1, s.length() -2))
	else false
	fi fi fi
    };

    i : Int;

    main() : SELF_TYPE {
	{
            i <- ~1;
	    out_string("Please enter a string:\n");
	    if pal(in_string())
	    then out_string("That was a palindrome.\n")
	    else out_string("That was not a palindrome.\n")
	    fi;
	}
    };
};

class Main2 inherits IO {
    main(): Object {
        let hello: String <- "Hello, ",
            name: String <- "",
            name: String <- "!\n"
        in {
            out_string("123");
        }
    };
};
