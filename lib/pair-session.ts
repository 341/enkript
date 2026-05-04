let expectedProof: string | null = null;

export function armPairSession(secret: string) {
  expectedProof = secret;
}

export function disarmPairSession() {
  expectedProof = null;
}

export function proofMatches(secret: string) {
  return expectedProof !== null && secret === expectedProof;
}
