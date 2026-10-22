import { configureMock } from "@/data";

// Nos testes, os repositórios mock respondem sem latência.
configureMock({ latencyMs: 0, failNetwork: false });
