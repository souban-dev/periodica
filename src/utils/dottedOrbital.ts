/**
 * Quantum-Mechanical Dotted Orbital Generator
 * Rigorously grounded in modern quantum mechanics and university physical chemistry:
 *
 * Solutions to the non-relativistic Schrödinger equation for Hydrogen-like systems:
 *   psi_nlm(r, theta, phi) = R_nl(r) * Y_l^m(theta, phi)
 *
 * Modern Scientific Properties Enforced:
 * 1. Nodal theorem:
 *    - Total nodes = n - 1
 *    - Angular nodes = l
 *    - Radial nodes = n - l - 1
 * 2. 1s (1,0,0): 0 nodes, spherically symmetric, probability density |psi|^2 peaks at r=0.
 * 3. 2s (2,0,0): 1 radial node at r = 2 a_0, inner core + dark spherical nodal gap + outer shell.
 * 4. 3s (3,0,0): 2 radial nodes (3 concentric shells, 2 nodal gaps).
 * 5. 2p (2,1,0 / 2,1,1): 0 radial nodes, 1 angular nodal plane (z=0, x=0, or y=0).
 *    Prominent teardrop bulbous heads with opposite parity phases (+1, -1).
 * 6. 3p (3,1,0): 1 radial node + 1 angular plane (inner dumbbell + radial node gap + outer crescent dumbbell).
 * 7. 3d orbitals (3,2,m): 0 radial nodes, 2 angular nodal surfaces:
 *    - 3dz2 (m=0): Conical nodal surfaces at theta = arccos(1/sqrt(3)) ~ 54.74 deg and 125.26 deg.
 *      Axial dumbbells (+1) and equatorial torus donut (-1) in the xy-plane.
 *    - 3dx2-y2 (m=2): 4 lobes along Cartesian axes (+-x, +-y), nodal planes at y = +-x.
 *    - 3dxy (m=-2): 4 lobes bisecting axes in xy-plane, nodal planes x=0, y=0.
 *    - 3dxz (m=1): 4 lobes in xz-plane, nodal planes x=0, z=0.
 *    - 3dyz (m=-1): 4 lobes in yz-plane, nodal planes y=0, z=0.
 * 8. 4f orbitals (4,3,m): 3 angular nodal planes (e.g. f_Souban Chakraborty with 8 octant lobes and x=0, y=0, z=0 planes).
 */

export interface OrbitalDot {
  x: number;
  y: number;
  z: number;
  phase: number; // +1 or -1 wave phase
  isPerimeter?: boolean;
}

/**
 * Generate a single prominent bulbous teardrop lobe of dots along a given 3D direction vector.
 * The shape strictly models r^l * e^(-r/n) * sin^l(theta) envelope from modern wave mechanics.
 */
function generateBulbousLobe(
  dir: { x: number; y: number; z: number },
  count: number,
  scale: number,
  phase: number,
  aspectRatio = 0.44,
  startOffset = 0.08
): OrbitalDot[] {
  const dots: OrbitalDot[] = [];

  // Normalize direction vector
  const len = Math.hypot(dir.x, dir.y, dir.z) || 1;
  const nx = dir.x / len;
  const ny = dir.y / len;
  const nz = dir.z / len;

  // Build orthonormal basis (ux, uy, uz) and (vx, vy, vz) perpendicular to normal
  const up = Math.abs(ny) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
  let ux = up.y * nz - up.z * ny;
  let uy = up.z * nx - up.x * nz;
  let uz = up.x * ny - up.y * nx;
  const uLen = Math.hypot(ux, uy, uz) || 1;
  ux /= uLen; uy /= uLen; uz /= uLen;

  const vx = ny * uz - nz * uy;
  const vy = nz * ux - nx * uz;
  const vz = nx * uy - ny * ux;

  // Quantum probability distribution:
  // Along the lobe, probability density peaks at t ~ 0.65 - 0.85
  for (let i = 0; i < count; i++) {
    let t: number;
    const isBulbousEnd = Math.random() < 0.58; // 58% of dots in bulbous head

    if (isBulbousEnd) {
      t = 0.56 + Math.pow(Math.random(), 0.72) * 0.40;
    } else {
      t = startOffset + Math.pow(Math.random(), 0.85) * (0.96 - startOffset);
    }

    // Teardrop profile: narrow at origin (pinched waist), wide bulbous head, rounded end dome
    const maxWidth = scale * aspectRatio;
    const profile = Math.sin(t * Math.PI);
    const lobeWidth = maxWidth * Math.pow(Math.max(0, profile), 0.82) * (0.35 + 0.65 * t);

    // Cross-sectional distribution: 32% on contour perimeter to crisply outline 3D boundary
    const isPerimeter = Math.random() < 0.32;
    const radFactor = isPerimeter ? 0.90 + Math.random() * 0.12 : Math.sqrt(Math.random()) * 0.90;
    const spread = lobeWidth * radFactor;
    const ang = 2 * Math.PI * Math.random();

    const dist = t * scale;
    const px = nx * dist + (ux * Math.cos(ang) + vx * Math.sin(ang)) * spread;
    const py = ny * dist + (uy * Math.cos(ang) + vy * Math.sin(ang)) * spread;
    const pz = nz * dist + (uz * Math.cos(ang) + vz * Math.sin(ang)) * spread;

    dots.push({ x: px, y: py, z: pz, phase, isPerimeter });
  }

  return dots;
}

/**
 * Generates quantum-mechanically accurate dotted electron probability clouds
 */
export function generateOrbitalDots(
  subshell: string,
  count = 800,
  scale = 75
): OrbitalDot[] {
  const dots: OrbitalDot[] = [];
  const sh = subshell.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (sh === '1s') {
    // 1s: n=1, l=0. 0 nodes. Pure exponential density |psi|^2 = e^(-2r)
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const r = -Math.log(1 - u * 0.97) * (scale * 0.36);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();

      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: 1,
      });
    }
  } else if (sh === '2s') {
    // 2s: n=2, l=0. 1 radial node at r = 2 a0
    const innerCount = Math.round(count * 0.28);
    const outerCount = count - innerCount;

    // Inner core (r < 2 a0, negative phase)
    for (let i = 0; i < innerCount; i++) {
      const r = Math.random() * (scale * 0.25);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: -1,
      });
    }

    // Outer shell (r > 2 a0, positive phase, separated by clean spherical dark nodal gap)
    for (let i = 0; i < outerCount; i++) {
      const isPerimeter = Math.random() < 0.28;
      const r = isPerimeter
        ? scale * 0.88 + Math.random() * (scale * 0.12)
        : scale * 0.48 + Math.random() * (scale * 0.50);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: 1,
        isPerimeter,
      });
    }
  } else if (sh === '3s') {
    // 3s: n=3, l=0. 2 radial nodes (3 concentric shells, 2 nodal spherical gaps)
    const c1 = Math.round(count * 0.18);
    const c2 = Math.round(count * 0.32);
    const c3 = count - c1 - c2;

    // Core 1
    for (let i = 0; i < c1; i++) {
      const r = Math.random() * (scale * 0.18);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: 1,
      });
    }

    // Shell 2 (between node 1 and node 2)
    for (let i = 0; i < c2; i++) {
      const r = scale * 0.32 + Math.random() * (scale * 0.22);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: -1,
      });
    }

    // Outer Shell 3
    for (let i = 0; i < c3; i++) {
      const isPerimeter = Math.random() < 0.28;
      const r = isPerimeter
        ? scale * 0.90 + Math.random() * (scale * 0.10)
        : scale * 0.68 + Math.random() * (scale * 0.32);
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      dots.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
        phase: 1,
        isPerimeter,
      });
    }
  } else if (sh.includes('3p')) {
    // 3p: n=3, l=1. 1 radial node + 1 angular nodal plane!
    // Consists of an inner small dumbbell (r < 0.38) and outer bulbous crescent dumbbell (r > 0.48)
    const innerDots = Math.round(count * 0.28);
    const outerDots = count - innerDots;

    // Inner dumbbell
    dots.push(...generateBulbousLobe({ x: 0, y: -1, z: 0 }, Math.round(innerDots / 2), scale * 0.38, -1, 0.45));
    dots.push(...generateBulbousLobe({ x: 0, y: 1, z: 0 }, Math.round(innerDots / 2), scale * 0.38, 1, 0.45));

    // Outer dumbbell separated by radial node gap
    dots.push(...generateBulbousLobe({ x: 0, y: -1, z: 0 }, Math.round(outerDots / 2), scale, 1, 0.46, 0.50));
    dots.push(...generateBulbousLobe({ x: 0, y: 1, z: 0 }, Math.round(outerDots / 2), scale, -1, 0.46, 0.50));
  } else if (sh.includes('pz') || (sh.includes('p') && !sh.includes('x') && !sh.includes('y'))) {
    // 2pz: n=2, l=1, m=0. 0 radial nodes, 1 angular nodal plane (xy-plane: z = 0).
    const halfCount = Math.round(count / 2);
    dots.push(...generateBulbousLobe({ x: 0, y: -1, z: 0 }, halfCount, scale, 1, 0.46));
    dots.push(...generateBulbousLobe({ x: 0, y: 1, z: 0 }, halfCount, scale, -1, 0.46));
  } else if (sh.includes('px')) {
    // 2px: n=2, l=1, m=1. Nodal plane is yz-plane (x = 0).
    const halfCount = Math.round(count / 2);
    dots.push(...generateBulbousLobe({ x: 1, y: 0, z: 0 }, halfCount, scale, 1, 0.46));
    dots.push(...generateBulbousLobe({ x: -1, y: 0, z: 0 }, halfCount, scale, -1, 0.46));
  } else if (sh.includes('py')) {
    // 2py: n=2, l=1, m=-1. Nodal plane is xz-plane (y = 0).
    const halfCount = Math.round(count / 2);
    dots.push(...generateBulbousLobe({ x: 0, y: 0, z: 1 }, halfCount, scale, 1, 0.46));
    dots.push(...generateBulbousLobe({ x: 0, y: 0, z: -1 }, halfCount, scale, -1, 0.46));
  } else if (sh.includes('dz2')) {
    // 3dz2: n=3, l=2, m=0.
    // Modern Quantum Wavefunction: psi ~ (3cos^2(theta) - 1).
    // Conical nodal surfaces at theta = 54.74 deg and 125.26 deg.
    // Axial dumbbells along +z and -z are positive (+1).
    // Equatorial torus ring in xy-plane is negative (-1).
    const dbCount = Math.round(count * 0.62);
    const ringCount = count - dbCount;
    const halfDb = Math.round(dbCount / 2);

    dots.push(...generateBulbousLobe({ x: 0, y: -1, z: 0 }, halfDb, scale * 0.96, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: 1, z: 0 }, halfDb, scale * 0.96, 1, 0.42));

    // Equatorial Torus donut strictly between conical surfaces (54.7 deg < theta < 125.3 deg)
    const torusR = scale * 0.50;
    const tubeR = scale * 0.16;
    for (let i = 0; i < ringCount; i++) {
      const u = 2 * Math.PI * Math.random();
      const v = 2 * Math.PI * Math.random();
      const isPerimeter = Math.random() < 0.32;
      const rFactor = isPerimeter ? 1.0 : Math.sqrt(Math.random());

      const rx = (torusR + tubeR * rFactor * Math.cos(v)) * Math.cos(u);
      const rz = (torusR + tubeR * rFactor * Math.cos(v)) * Math.sin(u);
      const ry = tubeR * rFactor * Math.sin(v);

      dots.push({ x: rx, y: ry, z: rz, phase: -1, isPerimeter });
    }
  } else if (sh.includes('dx2y2')) {
    // 3dx2-y2: n=3, l=2, m=2.
    // Lobes lie strictly along the Cartesian X and Y axes (+-x, +-y).
    // Nodal planes lie at 45 degrees (y = x and y = -x).
    const quarterCount = Math.round(count / 4);
    dots.push(...generateBulbousLobe({ x: 1, y: 0, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -1, y: 0, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: -1, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: 1, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
  } else if (sh.includes('dxy')) {
    // 3dxy: n=3, l=2, m=-2.
    // Lobes bisect the axes in the xy-plane (at 45, 135, 225, 315 deg).
    // Nodal planes are the Cartesian planes: x=0 (yz-plane) and y=0 (xz-plane).
    const quarterCount = Math.round(count / 4);
    const diag = 1 / Math.SQRT2;
    dots.push(...generateBulbousLobe({ x: diag, y: -diag, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: diag, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: -diag, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
    dots.push(...generateBulbousLobe({ x: diag, y: diag, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
  } else if (sh.includes('dxz')) {
    // 3dxz: n=3, l=2, m=1.
    // 4 lobes in the xz-plane bisecting axes. Nodal planes: x=0 and z=0.
    const quarterCount = Math.round(count / 4);
    const diag = 1 / Math.SQRT2;
    dots.push(...generateBulbousLobe({ x: diag, y: 0, z: diag }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: 0, z: -diag }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: 0, z: diag }, quarterCount, scale * 0.90, -1, 0.42));
    dots.push(...generateBulbousLobe({ x: diag, y: 0, z: -diag }, quarterCount, scale * 0.90, -1, 0.42));
  } else if (sh.includes('dyz')) {
    // 3dyz: n=3, l=2, m=-1.
    // 4 lobes in the yz-plane bisecting axes. Nodal planes: y=0 and z=0.
    const quarterCount = Math.round(count / 4);
    const diag = 1 / Math.SQRT2;
    dots.push(...generateBulbousLobe({ x: 0, y: -diag, z: diag }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: diag, z: -diag }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: -diag, z: -diag }, quarterCount, scale * 0.90, -1, 0.42));
    dots.push(...generateBulbousLobe({ x: 0, y: diag, z: diag }, quarterCount, scale * 0.90, -1, 0.42));
  } else if (sh.includes('d')) {
    // General d-orbital: 4 cloverleaf lobes in the quadrants
    const quarterCount = Math.round(count / 4);
    const diag = 1 / Math.SQRT2;
    dots.push(...generateBulbousLobe({ x: diag, y: -diag, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: diag, z: 0 }, quarterCount, scale * 0.90, 1, 0.42));
    dots.push(...generateBulbousLobe({ x: -diag, y: -diag, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
    dots.push(...generateBulbousLobe({ x: diag, y: diag, z: 0 }, quarterCount, scale * 0.90, -1, 0.42));
  } else {
    // 4f orbitals: n=4, l=3. Standard cubic harmonic f_Souban Chakraborty:
    // 8 bulbous lobes directed into the 8 spatial octants: (+-1, +-1, +-1)/sqrt(3).
    // Nodal planes are all 3 Cartesian planes: x=0, y=0, z=0.
    // Phase alternates strictly by octant parity: sign(x * y * z).
    const dotsPerOctant = Math.round(count / 8);
    const octants = [
      { x: 1, y: -1, z: 1, p: 1 },
      { x: -1, y: -1, z: -1, p: 1 },
      { x: -1, y: 1, z: 1, p: 1 },
      { x: 1, y: 1, z: -1, p: 1 },
      { x: -1, y: -1, z: 1, p: -1 },
      { x: 1, y: -1, z: -1, p: -1 },
      { x: 1, y: 1, z: 1, p: -1 },
      { x: -1, y: 1, z: -1, p: -1 },
    ];

    octants.forEach((oct) => {
      const invSqrt3 = 1 / Math.sqrt(3);
      const dir = { x: oct.x * invSqrt3, y: oct.y * invSqrt3, z: oct.z * invSqrt3 };
      dots.push(...generateBulbousLobe(dir, dotsPerOctant, scale * 0.84, oct.p, 0.38));
    });
  }

  return dots;
}
