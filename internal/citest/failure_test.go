package citest

import "testing"

func TestIntentionalFailure(t *testing.T) {
	t.Errorf("Simulasi CI gagal!")
}
