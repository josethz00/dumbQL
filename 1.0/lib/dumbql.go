package lib

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
)

type DumbQL struct {
	db       map[string]string
	hadError bool
}

func NewDumbQL() DumbQL {
	dumbql := DumbQL{db: make(map[string]string)}
	dumbql.db["name"] = "myfirstdumbql"
	dumbql.db["path"] = filepath.Join("..", "data", fmt.Sprintf("%s.json", dumbql.db["name"]))
	return dumbql
}

func (d DumbQL) CreateDatabase(name string) {
	dirPath := filepath.Join("..", "data")
	d.db["name"] = name
	d.db["path"] = filepath.Join(dirPath, fmt.Sprintf("%s.json", d.db["name"]))

	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		/*
		   os.Stat returns
		   fileInfo and err and then we check if the error is
		   that the file does not exist
		*/
		errMkDir := os.Mkdir(dirPath, 0755)
		if errMkDir != nil {
			panic(errMkDir)
		}
	}

	_, errCreate := os.Create(d.db["path"])
	if errCreate != nil {
		panic(errCreate)
	}

	fmt.Println(fmt.Sprintf("Created database %s at %s", d.db["name"], d.db["path"]))
}

func (d DumbQL) RunPrompt() {
	scanner := bufio.NewScanner(os.Stdin)

	for {
		fmt.Print("DumbQL> ")
		scanner.Scan()
		d.Run(scanner.Text())
		d.hadError = false
	}
}

func (d DumbQL) Run(input string) {
	scanner := NewScanner(input, d)
	tokens := scanner.scanTokens()

	for _, token := range tokens {
		fmt.Println(token)
	}
}

func DumbQLError(d DumbQL, line int, message string) {
	DumbQLReport(d, line, "", message)
}

func DumbQLReport(d DumbQL, line int, where string, message string) {
	fmt.Printf("[line %d] Error %s: %s \r \n", line, where, message)
	d.hadError = true
}

func (d DumbQL) RunFile(path string) {
	fmt.Println("TODO: Running file")
}
