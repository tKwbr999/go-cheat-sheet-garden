
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import CheatSheetSection from '@/components/CheatSheetSection';
import TableOfContents from '@/components/TableOfContents';
import GoLogo from '@/components/GoLogo';
import { ArrowUp } from 'lucide-react';

// Data for the cheat sheet sections
const cheatSheetData = [
  {
    title: "Basics",
    codeExamples: [
      {
        title: "Hello World",
        code: `package main

import "fmt"

func main() {
  fmt.Println("Hello, World!")
}`,
      },
      {
        title: "Variables",
        code: `// Variable declaration
var name string = "Go"

// Short variable declaration
age := 10

// Multiple variables
var (
  a, b int
  c    string
)`,
      },
      {
        title: "Constants",
        code: `// Constant declaration
const Pi = 3.14

// Multiple constants
const (
  StatusOK    = 200
  StatusError = 500
)

// iota
const (
  Monday = iota + 1 // 1
  Tuesday           // 2
  Wednesday         // 3
)`,
      },
    ],
  },
  {
    title: "Basic Types",
    codeExamples: [
      {
        title: "Numeric",
        code: `// Integer types
var i int = 42
var u uint = 42
var i8 int8 = 127
var i16 int16 = 32767
var i32 int32 = 2147483647
var i64 int64 = 9223372036854775807

// Float types
var f32 float32 = 3.14
var f64 float64 = 3.14159265359`,
      },
      {
        title: "String",
        code: `// String declaration
var str string = "hello"

// Raw string literal
multiline := \`This is a
multiline string\`

// String operations
s := "hello"
len := len(s)     // Length: 5
char := s[1]      // byte: 101 ('e')
substr := s[1:3]  // "el"`,
      },
      {
        title: "Boolean",
        code: `// Boolean values
var isTrue bool = true
var isFalse bool = false

// Boolean operations
result := isTrue && isFalse  // false
result = isTrue || isFalse   // true
result = !isTrue             // false`,
      },
    ],
  },
  {
    title: "Flow control",
    codeExamples: [
      {
        title: "If-else",
        code: `// Basic if-else
if x > 10 {
  // do something
} else if x > 5 {
  // do something else
} else {
  // do another thing
}

// If with short statement
if value := getValue(); value > 10 {
  // use value
}`,
      },
      {
        title: "For loops",
        code: `// Standard for loop
for i := 0; i < 10; i++ {
  // loop body
}

// For as while
for condition {
  // loop body
}

// Infinite loop
for {
  // loop body
  if shouldBreak {
    break
  }
}

// For-range loop
for index, value := range collection {
  // use index and value
}`,
      },
      {
        title: "Switch",
        code: `// Basic switch
switch value {
case 1:
  // code for 1
case 2, 3:
  // code for 2 or 3
default:
  // default code
}

// Switch with no expression
switch {
case x > 100:
  // code for x > 100
case x > 10:
  // code for x > 10
default:
  // default code
}`,
      },
    ],
  },
  {
    title: "Functions",
    codeExamples: [
      {
        title: "Basic Function",
        code: `// Function declaration
func add(a int, b int) int {
  return a + b
}

// Multiple return values
func divAndRemainder(a, b int) (int, int) {
  return a / b, a % b
}

// Named return values
func split(sum int) (x, y int) {
  x = sum * 4 / 9
  y = sum - x
  return // naked return
}`,
      },
      {
        title: "Variadic Functions",
        code: `// Variadic function
func sum(nums ...int) int {
  total := 0
  for _, num := range nums {
    total += num
  }
  return total
}

// Calling a variadic function
total := sum(1, 2, 3, 4) // 10

// Spreading a slice
numbers := []int{1, 2, 3, 4}
total = sum(numbers...) // 10`,
      },
      {
        title: "Closures",
        code: `// Function that returns a function
func adder() func(int) int {
  sum := 0
  return func(x int) int {
    sum += x
    return sum
  }
}

// Using a closure
pos := adder()
result := pos(10) // 10
result = pos(20)  // 30
result = pos(30)  // 60`,
      },
    ],
  },
  {
    title: "Data structures",
    codeExamples: [
      {
        title: "Arrays",
        code: `// Array declaration
var a [5]int // [0 0 0 0 0]

// Array initialization
b := [3]int{1, 2, 3}

// Array with implicit size
c := [...]int{4, 5, 6, 7} // [4]int

// Accessing elements
first := a[0]
a[0] = 10`,
      },
      {
        title: "Slices",
        code: `// Slice declaration
var s []int // nil slice

// Make a slice
s = make([]int, 5)     // len=5, cap=5
s = make([]int, 3, 10) // len=3, cap=10

// Slice literal
s = []int{1, 2, 3} // len=3, cap=3

// Append to slice
s = append(s, 4, 5) // [1 2 3 4 5]

// Slice of a slice
sub := s[1:3] // [2 3]`,
      },
      {
        title: "Maps",
        code: `// Map declaration
var m map[string]int // nil map

// Make a map
m = make(map[string]int)

// Map literal
m = map[string]int{
  "one": 1,
  "two": 2,
}

// Map operations
m["three"] = 3   // Add/update
value := m["one"] // Get: 1
delete(m, "two")  // Delete
value, exists := m["four"] // Check: 0, false`,
      },
    ],
  },
  {
    title: "Packages",
    codeExamples: [
      {
        title: "Package",
        code: `// File: math.go
package math

// Exported function (capitalized)
func Add(a, b int) int {
  return a + b
}

// Unexported function (lowercase)
func multiply(a, b int) int {
  return a * b
}`,
      },
      {
        title: "Import",
        code: `// Single import
import "fmt"

// Multiple imports
import (
  "fmt"
  "math"
  "strings"
)

// Import with alias
import (
  f "fmt"
  m "math"
)

// Using the imports
f.Println(m.Pi)`,
      },
      {
        title: "Package initialization",
        code: `package mypackage

// Package variables
var PackageVar int

// init function runs when package is imported
func init() {
  PackageVar = 42
  // initialization code
}

func DoSomething() {
  // function code
}`,
      },
    ],
  },
  {
    title: "Concurrency",
    codeExamples: [
      {
        title: "Goroutines",
        code: `// Start a goroutine
go func() {
  // code runs concurrently
  fmt.Println("Running in goroutine")
}()

// Run a function in a goroutine
go myFunction(arg1, arg2)

// Main continues execution
fmt.Println("Main function continues")`,
      },
      {
        title: "Channels",
        code: `// Create a channel
ch := make(chan int)      // unbuffered
ch := make(chan int, 10)  // buffered

// Send to channel
ch <- 42  // blocks if channel is full

// Receive from channel
value := <-ch  // blocks if channel is empty

// Close a channel
close(ch)

// Range over channel
for value := range ch {
  // process value
}`,
      },
      {
        title: "Select",
        code: `// Select statement
select {
case value := <-ch1:
  // handle value from ch1
case ch2 <- value:
  // sent value to ch2
case <-time.After(1 * time.Second):
  // timeout after 1 second
default:
  // run if no channel is ready
}`,
      },
    ],
  },
  {
    title: "Error handling",
    codeExamples: [
      {
        title: "Errors",
        code: `// Function returning an error
func divide(a, b int) (int, error) {
  if b == 0 {
    return 0, errors.New("division by zero")
  }
  return a / b, nil
}

// Error handling
result, err := divide(10, 2)
if err != nil {
  fmt.Println("Error:", err)
  return
}
fmt.Println("Result:", result)`,
      },
      {
        title: "Custom errors",
        code: `// Define a custom error type
type MyError struct {
  Code    int
  Message string
}

// Implement the Error interface
func (e *MyError) Error() string {
  return fmt.Sprintf("error %d: %s", e.Code, e.Message)
}

// Return a custom error
func doSomething() error {
  return &MyError{
    Code:    500,
    Message: "something went wrong",
  }
}`,
      },
    ],
  },
  {
    title: "Methods",
    codeExamples: [
      {
        title: "Methods",
        code: `// Define a type
type Rectangle struct {
  Width, Height float64
}

// Method with a receiver
func (r Rectangle) Area() float64 {
  return r.Width * r.Height
}

// Pointer receiver for modification
func (r *Rectangle) Scale(factor float64) {
  r.Width *= factor
  r.Height *= factor
}

// Using methods
rect := Rectangle{10, 5}
area := rect.Area()       // 50
rect.Scale(2)             // Width=20, Height=10`,
      },
      {
        title: "Value vs Pointer Receivers",
        code: `// Value receiver (copy)
func (r Rectangle) Double() Rectangle {
  return Rectangle{
    Width:  r.Width * 2,
    Height: r.Height * 2,
  }
}

// Pointer receiver (modify original)
func (r *Rectangle) Resize(w, h float64) {
  r.Width = w
  r.Height = h
}

// Usage
rect := Rectangle{5, 10}
rect2 := rect.Double()    // New rectangle
rect.Resize(20, 30)       // Modified original`,
      },
    ],
  },
  {
    title: "Interfaces",
    codeExamples: [
      {
        title: "Defining Interfaces",
        code: `// Interface definition
type Shape interface {
  Area() float64
  Perimeter() float64
}

// Types that implement the interface
type Rectangle struct {
  Width, Height float64
}

func (r Rectangle) Area() float64 {
  return r.Width * r.Height
}

func (r Rectangle) Perimeter() float64 {
  return 2 * (r.Width + r.Height)
}

// Using interfaces
func printShapeInfo(s Shape) {
  fmt.Printf("Area: %f, Perimeter: %f\\n", 
    s.Area(), s.Perimeter())
}

rect := Rectangle{5, 10}
printShapeInfo(rect)`,
      },
      {
        title: "Empty Interface",
        code: `// Empty interface can hold any value
var i interface{}
i = 42            // int
i = "hello"       // string
i = struct{}{} // struct

// Type assertions
str, ok := i.(string)
if ok {
  fmt.Println(str) // "hello"
}

// Type switch
switch v := i.(type) {
case int:
  fmt.Println("int:", v)
case string:
  fmt.Println("string:", v)
default:
  fmt.Println("unknown type")
}`,
      },
    ],
  },
  {
    title: "References",
    codeExamples: [
      {
        title: "Go Documentation",
        code: `// Official Go Documentation
// https://golang.org/doc/

// Go Standard Library
// https://golang.org/pkg/

// Go Tour
// https://tour.golang.org/

// Effective Go
// https://golang.org/doc/effective_go.html`,
      },
      {
        title: "Tools",
        code: `// Go command
go build    // Compile packages
go run      // Compile and run
go test     // Test packages
go get      // Download and install packages
go fmt      // Format source code
go vet      // Report likely mistakes
go mod      // Module maintenance`,
      },
    ],
  },
];

// Create sections for table of contents
const tocSections = cheatSheetData.map(section => ({
  title: section.title,
  id: section.title.toLowerCase().replace(/\s+/g, '-')
}));

const Index = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTableOfContentsOpen, setIsTableOfContentsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 500) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openTableOfContents = () => {
    setIsTableOfContentsOpen(true);
  };

  const closeTableOfContents = () => {
    setIsTableOfContentsOpen(false);
  };

  return (
    <div className="bg-white min-h-screen">
      <Header onOpenTableOfContents={openTableOfContents} />
      
      <div className="flex">
        {/* Table of Contents */}
        <TableOfContents 
          sections={tocSections} 
          isOpen={isTableOfContentsOpen} 
          onClose={closeTableOfContents} 
        />
        
        <div className="flex-1">
          {/* Hero Section */}
          <section className="pt-32 pb-16 px-6">
            <div className="container mx-auto max-w-5xl">
              <div className="flex flex-col items-center text-center mb-12 animate-fade-in">
                <GoLogo size={80} className="mb-6" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Go Language Cheatsheet
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl">
                  A comprehensive reference for the Go programming language syntax, standard library, and best practices.
                </p>
              </div>
              
              {/* Main Content */}
              <div className="mt-16">
                {cheatSheetData.map((section, index) => (
                  <CheatSheetSection
                    key={index}
                    id={section.title.toLowerCase().replace(/\s+/g, '-')}
                    title={section.title}
                    codeExamples={section.codeExamples}
                  />
                ))}
              </div>
            </div>
          </section>
          
          {/* Footer */}
          <footer className="bg-gray-50 py-12 border-t border-gray-200">
            <div className="container mx-auto max-w-5xl px-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-6 md:mb-0">
                  <GoLogo size={28} className="mr-3" />
                  <p className="text-gray-600">Go Cheatsheet © {new Date().getFullYear()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">
                    Go is an open source programming language supported by Google
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-go-blue text-white p-3 rounded-full shadow-lg transition-all duration-300 transform ${
          showScrollButton ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
      
      {/* Overlay for mobile */}
      {isTableOfContentsOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeTableOfContents}
        />
      )}
    </div>
  );
};

export default Index;
