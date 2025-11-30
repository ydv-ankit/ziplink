package helpers

import (
	"os"
	"strings"
)

func EnvParser(filepath ...string) {
	if len(filepath) == 0 {
		// fallback to default file
		filepath = append(filepath, ".env")
	}
	content, err := os.ReadFile(filepath[0])
	if err != nil {
		panic("failed to load" + filepath[0] + "file")
	}
	envArgs := strings.Split(string(content), "\n")
	for idx := range len(envArgs) {
		envKV := strings.Split(envArgs[idx], "=")
		val := strings.Split(envKV[1], "\"")
		if len(val) > 1 {
			os.Setenv(envKV[0], val[1])
		} else {
			os.Setenv(envKV[0], val[0])
		}
	}
	Log("env setup complete")
}
