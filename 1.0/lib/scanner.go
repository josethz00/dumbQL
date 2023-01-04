package lib

import (
	"fmt"
	"strconv"
)

type Scanner struct {
	source         string
	tokens         []Token
	start          int
	current        int
	line           int
	dumbqlInstance DumbQL
	keywords       map[string]TokenType
}

func NewScanner(source string, dumbqlInstance DumbQL) Scanner {
	scanner := Scanner{
		source:         source,
		start:          0,
		current:        0,
		line:           1,
		dumbqlInstance: dumbqlInstance,
		keywords: map[string]TokenType{
			"and":      AND,
			"insert":   INSERT,
			"into":     INTO,
			"values":   VALUES,
			"select":   SELECT,
			"from":     FROM,
			"where":    WHERE,
			"create":   CREATE,
			"table":    TABLE,
			"database": DATABASE,
			"or":       OR,
			"not":      NOT,
		},
	}
	return scanner
}

func (s Scanner) isAtEnd() bool {
	fmt.Println(s.current)
	fmt.Println(len(s.source))
	return s.current >= len(s.source)
}

func (s Scanner) scanTokens() []Token {
	for !s.isAtEnd() {
		s.start = s.current
		s.scanToken()
	}

	s.tokens = append(s.tokens, NewToken(EOF, "", nil, s.line))
	return s.tokens
}

func (s Scanner) scanToken() {
	c := s.advance()

	switch c {
	case "(":
		s.addToken(LEFT_PAREN, nil)

	case ")":
		s.addToken(RIGHT_PAREN, nil)

	case "{":
		s.addToken(LEFT_BRACE, nil)

	case "}":
		s.addToken(RIGHT_BRACE, nil)

	case ",":
		s.addToken(COMMA, nil)

	case ".":
		s.addToken(DOT, nil)

	case "-":
		s.addToken(MINUS, nil)

	case "+":
		s.addToken(PLUS, nil)

	case ";":
		s.addToken(SEMICOLON, nil)

	case "*":
		s.addToken(STAR, nil)

	case "!":
		if s.match("=") {
			s.addToken(BANG_EQUAL, nil)
		} else {
			s.addToken(BANG, nil)
		}

	case "=":
		if s.match("=") {
			s.addToken(EQUAL_EQUAL, nil)
		} else {
			s.addToken(EQUAL, nil)
		}

	case "<":
		if s.match("=") {
			s.addToken(LESS_EQUAL, nil)
		} else {
			s.addToken(LESS, nil)
		}

	case ">":
		if s.match("=") {
			s.addToken(GREATER_EQUAL, nil)
		} else {
			s.addToken(GREATER, nil)
		}

	case "/":
		if s.match("/") {
			// A comment goes until the end of the line.
			for strpeek, _ := s.peek(); strpeek != "\n" && !s.isAtEnd(); {
				s.advance()
			}
		} else {
			s.addToken(SLASH, nil)
		}

	case " ", "\r", "\t":
		// Ignore whitespace.

	case "\n":
		s.line++
		break

	case "\"":
		s.string()
		break
	case "o":
		if s.match("r") {
			s.addToken(OR, nil)
		}
		break

	default:
		if isDigit(c) {
			s.number()
		} else if isAlpha(c) { // ensure first character is a letter or underscore
			s.identifier()
		} else {
			DumbQLError(s.dumbqlInstance, s.line, "Unexpected character.")
		}
		break
	}
}

func (s Scanner) advance() string {
	// s.current is the index of the next character to be read
	// but the current character is returned
	s.current++
	return string(s.source[s.current-1])
}

func (s Scanner) addToken(tokenType TokenType, literal interface{}) {
	text := s.source[s.start:s.current]
	s.tokens = append(s.tokens, NewToken(tokenType, text, literal, s.line))
}

func (s Scanner) match(expected string) bool {
	if s.isAtEnd() {
		return false
	}

	if string(s.source[s.current]) != expected {
		return false
	}

	s.current++
	return true
}

func (s Scanner) peek() (string, bool) {
	if s.isAtEnd() {
		return "", false
	}

	return string(s.source[s.current]), true
}

func (s Scanner) string() {
	for strpeek, _ := s.peek(); strpeek != "\"" && !s.isAtEnd(); {
		if strpeek == "\n" {
			s.line++
		}
		s.advance()
	}

	// Unterminated string.
	if s.isAtEnd() {
		DumbQLError(s.dumbqlInstance, s.line, "Unterminated string.")
		return
	}

	// The closing ".
	s.advance()

	// Trim the surrounding quotes.
	value := s.source[s.start+1 : s.current-1]
	s.addToken(STRING, value)
}

func isDigit(c string) bool {
	return c >= "0" && c <= "9"
}

func isAlpha(c string) bool {
	return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c == "_"
}

func isAlphaNumeric(c string) bool {
	return isAlpha(c) || isDigit(c)
}

func (s Scanner) number() {
	for strpeek, _ := s.peek(); isDigit(strpeek); {
		s.advance()
	}

	strrpeek, _ := s.peek()
	strrrpeek, _ := s.peekNext()

	// Look for a fractional part.
	if strrpeek == "." && isDigit(strrrpeek) {
		// Consume the "."
		s.advance()

		for strapeek, _ := s.peek(); isDigit(strapeek); { // Consume the digits after the "." (DECIMAL PARTS)
			s.advance()
		}
	}

	value, _ := strconv.ParseFloat(s.source[s.start:s.current], 64)
	s.addToken(NUMBER, value)
}

func (s Scanner) peekNext() (string, bool) {
	if s.current+1 >= len(s.source) {
		return "", false
	}

	return string(s.source[s.current+1]), true
}

func (s Scanner) identifier() {
	for strpeek, boolpeek := s.peek(); isAlphaNumeric(strpeek) && boolpeek; {
		s.advance()
	}
	text := s.source[s.start:s.current]
	tokenType, ok := s.keywords[text]
	if !ok {
		tokenType = IDENTIFIER
	}
	s.addToken(tokenType, nil)
}
