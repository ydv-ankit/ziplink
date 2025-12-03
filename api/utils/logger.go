package utils

import (
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"
)

func GetCurrentFilePath(file string) string {
	wd, err := os.Getwd()
	if err != nil {
		return file
	}
	var currFile string
	if len(strings.Split(file, wd)) > 1 {
		currFile = "." + strings.Split(file, wd)[1]
	} else {
		currFile = "." + strings.Split(file, wd)[0]
	}
	return currFile
}

func Log(s string) {
	_, file, line, ok := runtime.Caller(1)
	if ok {
		currentFile := GetCurrentFilePath(file)
		fmt.Printf("[%s] -> %s:%d: %v\n", time.DateTime, currentFile, line, s)
	} else {
		fmt.Printf("[%s] -> %s", time.DateTime, s)
	}
}
