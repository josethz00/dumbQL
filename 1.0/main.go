package main

import (
	"fmt"
	"os"

	"dumbql.com/main/lib"
)

func main() {
	dumbql := lib.NewDumbQL()

	args := os.Args[1:]

	if len(args) > 1 {
		fmt.Println("Usage: dumbql [database name]")
		os.Exit(1)
	} else if len(args) == 1 {
		dumbql.RunFile(args[0])
	} else {
		dumbql.RunPrompt()
	}

	fmt.Println("Hello, World!")
}
