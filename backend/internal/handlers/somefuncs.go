package handlers

func splitTokenData(some string) []string {
	id := ""
	name := ""
	time := ""
	firsti := 0

	for i, x := range some {
		if x == ';' {
			firsti = i
			id = some[:i]
			break
		}
	}

	for i := len(some) - 1; i > firsti; i-- {
		if some[i] == ';' {
			name = some[firsti+1 : i]
			time = some[i+1:]
			break
		}
	}
	return []string{id, name, time}

}
