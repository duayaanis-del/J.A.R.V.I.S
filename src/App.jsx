import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import jarvisBg from "./assets/jarvis-bp.jpg";
import pantherBg from "./assets/image_058cd8.jpg";
import avengersBg from "./assets/image_058cb2.jpg";
import ironmanBg from "./assets/image_058c75.jpg";
import reactorBg from "./assets/image_058c16.jpg";

// ============================================================================
// BIOMETRIC SECURITY GATE (HUD HACKING SCANNER EFFECT)
// ============================================================================
function AuthGate({ onAuthenticated }) {
  const [status, setStatus] = useState("SYSTEM LOCKED — INITIATE BIOMETRIC SCAN");
  const [scanning, setScanning] = useState(false);

  const bufferToString = (buf) => Array.from(new Uint8Array(buf)).join(",");
  const stringToBuffer = (str) => Uint8Array.from(str.split(",").map(Number));

  const authenticateFingerprint = async () => {
    setScanning(true);
    setStatus("ESTABLISHING NEURAL LINK... SCANNING FINGERPRINT");

    try {
      const savedCredentialId = localStorage.getItem("jv_fingerprint_id");

      if (!savedCredentialId) {
        if (!window.PublicKeyCredential) {
          setTimeout(() => {
            setScanning(false);
            localStorage.setItem("jv_fingerprint_id", "fallback_id");
            setStatus("ACCESS GRANTED [SIMULATED]");
            setTimeout(() => onAuthenticated(), 800);
          }, 1500);
          return;
        }

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
            rp: { name: "JARVIS Security Grid", id: window.location.hostname },
            user: {
              id: new Uint8Array([1, 2, 3, 4]),
              name: "commander",
              displayName: "JARVIS Commander",
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required",
            },
            timeout: 60000,
          },
        });

        if (credential) {
          const credIdStr = bufferToString(credential.rawId);
          localStorage.setItem("jv_fingerprint_id", credIdStr);
          setStatus("BIOMETRIC ENROLLED. ACCESS GRANTED.");
          setTimeout(() => onAuthenticated(), 800);
        }
      } else {
        const credIdUint8 = stringToBuffer(savedCredentialId);
        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
            allowCredentials: [{ id: credIdUint8, type: "public-key" }],
            userVerification: "required",
            timeout: 60000,
          },
        });

        if (assertion) {
          setStatus("IDENTITY VERIFIED. WELCOME BACK, COMMANDER.");
          setTimeout(() => onAuthenticated(), 600);
        }
      }
    } catch (err) {
      setScanning(false);
      if (err.name === "NotAllowedError") {
        setStatus("SCAN ABORTED. ACCESS DENIED.");
      } else {
        setTimeout(() => {
          setStatus("ACCESS GRANTED [OVERRIDE]");
          setTimeout(() => onAuthenticated(), 800);
        }, 1000);
      }
    }
  };

  const resetEnrollment = () => {
    localStorage.removeItem("jv_fingerprint_id");
    setStatus("MEMORY WIPED. READY FOR NEW SCAN.");
  };

  return (
    <div style={gateStyles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');

        @keyframes hudPulse {
          0% { box-shadow: 0 0 15px rgba(79, 216, 232, 0.2), inset 0 0 15px rgba(79, 216, 232, 0.2); }
          50% { box-shadow: 0 0 35px rgba(79, 216, 232, 0.6), inset 0 0 35px rgba(79, 216, 232, 0.6); }
          100% { box-shadow: 0 0 15px rgba(79, 216, 232, 0.2), inset 0 0 15px rgba(79, 216, 232, 0.2); }
        }

        @keyframes scanBeam {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hud-ring-outer { animation: rotateRing 12s linear infinite; }
        .hud-ring-inner { animation: rotateRing 6s linear infinite reverse; }

        .scan-line {
          position: absolute;
          width: 100%;
          height: 3px;
          background: #4FD8E8;
          box-shadow: 0 0 12px #4FD8E8;
          animation: scanBeam 1.8s ease-in-out infinite;
        }
      `}</style>

      <div style={gateStyles.cornerTL} />
      <div style={gateStyles.cornerTR} />
      <div style={gateStyles.cornerBL} />
      <div style={gateStyles.cornerBR} />

      <div style={{ ...gateStyles.scannerWrapper, animation: scanning ? "hudPulse 1.2s infinite" : "none" }}>
        <div className="hud-ring-outer" style={gateStyles.ringOuter} />
        <div className="hud-ring-inner" style={gateStyles.ringInner} />

        <div style={gateStyles.iconCircle} onClick={authenticateFingerprint}>
          {scanning && <div className="scan-line" />}
          <span style={gateStyles.fingerprintIcon}>👆</span>
        </div>
      </div>

      <h2 style={gateStyles.title}>SECURITY GATE — BIOMETRIC AUTH</h2>
      <p style={gateStyles.status}>{status}</p>

      <div style={{ display: "flex", gap: "12px", zIndex: 10 }}>
        <button style={gateStyles.btn} onClick={authenticateFingerprint}>
          {scanning ? "SCANNING..." : "SCAN FINGERPRINT"}
        </button>
        <button style={{ ...gateStyles.btn, borderColor: "#FF5FA0", color: "#FF5FA0" }} onClick={resetEnrollment}>
          RESET
        </button>
      </div>
    </div>
  );
}

const gateStyles = {
  container: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "#05080C",
    backgroundImage: `url(${jarvisBg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'JetBrains Mono', monospace",
    color: "#E7EEF5",
    overflow: "hidden",
  },
  cornerTL: { position: "absolute", top: 24, left: 24, width: 40, height: 40, borderTop: "2px solid #4FD8E8", borderLeft: "2px solid #4FD8E8" },
  cornerTR: { position: "absolute", top: 24, right: 24, width: 40, height: 40, borderTop: "2px solid #4FD8E8", borderRight: "2px solid #4FD8E8" },
  cornerBL: { position: "absolute", bottom: 24, left: 24, width: 40, height: 40, borderBottom: "2px solid #4FD8E8", borderLeft: "2px solid #4FD8E8" },
  cornerBR: { position: "absolute", bottom: 24, right: 24, width: 40, height: 40, borderBottom: "2px solid #4FD8E8", borderRight: "2px solid #4FD8E8" },
  scannerWrapper: {
    position: "relative",
    width: "160px",
    height: "160px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "32px",
    cursor: "pointer",
  },
  ringOuter: {
    position: "absolute",
    inset: -10,
    borderRadius: "50%",
    border: "2px dashed rgba(79, 216, 232, 0.4)",
    pointerEvents: "none",
  },
  ringInner: {
    position: "absolute",
    inset: -4,
    borderRadius: "50%",
    border: "1.5px solid rgba(79, 216, 232, 0.7)",
    borderTopColor: "transparent",
    pointerEvents: "none",
  },
  iconCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(10, 16, 28, 0.9)",
    border: "2px solid #4FD8E8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 25px rgba(79, 216, 232, 0.4)",
    overflow: "hidden",
    position: "relative",
  },
  fingerprintIcon: {
    fontSize: "52px",
    filter: "drop-shadow(0 0 8px #4FD8E8)",
  },
  title: {
    fontSize: "16px",
    letterSpacing: "4px",
    color: "#4FD8E8",
    marginBottom: "10px",
    textShadow: "0 0 10px rgba(79, 216, 232, 0.6)",
  },
  status: {
    fontSize: "12px",
    letterSpacing: "1.5px",
    color: "#9DB2C0",
    marginBottom: "30px",
    textAlign: "center",
    maxWidth: "400px",
  },
  btn: {
    padding: "12px 28px",
    borderRadius: "6px",
    background: "rgba(8,11,16,0.85)",
    border: "1.5px solid #4FD8E8",
    color: "#4FD8E8",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "2.5px",
    cursor: "pointer",
    boxShadow: "0 0 16px rgba(79,216,232,0.35)",
    backdropFilter: "blur(6px)",
  },
};

// ============================================================================
// THREE.JS ORB COMPONENT (Voice Reactive, Variable Speeds & MediaPipe Gestures)
// ============================================================================
function glowTexture(color1, color2) {
  const size = 128;
  const cvs = document.createElement('canvas');
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color1);
  g.addColorStop(0.4, color2);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cvs);
}

function ThreeJarvisOrb({ size = 260, micLevel = 0, speed = 1.0, zoomSensitivity = 2.0, gestureState }) {
  const mountRef = useRef(null);
  const micLevelRef = useRef(micLevel);
  const speedRef = useRef(speed);
  const zoomSensitivityRef = useRef(zoomSensitivity);
  const gestureRef = useRef(gestureState);

  useEffect(() => {
    micLevelRef.current = micLevel;
    speedRef.current = speed;
    zoomSensitivityRef.current = zoomSensitivity;
    gestureRef.current = gestureState;
  }, [micLevel, speed, zoomSensitivity, gestureState]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const coreGlowTex = glowTexture('rgba(180,235,255,1)', 'rgba(20,140,255,0.6)');

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    const core = new THREE.Sprite(new THREE.SpriteMaterial({
      map: coreGlowTex, color: 0x88ccff, blending: THREE.AdditiveBlending, depthWrite: false
    }));
    core.scale.set(1.4, 1.4, 1.4);
    orbGroup.add(core);

    const spheres = [];
    [0.75, 1.15, 1.55].forEach((r, i) => {
      const geo = new THREE.SphereGeometry(r, 16, 12);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x1fa2ff, wireframe: true, transparent: true,
        opacity: 0.14 - i * 0.02, blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.baseScale = r;
      mesh.userData.spin = 0.0006 * (i + 1) * (i % 2 === 0 ? 1 : -1);
      spheres.push(mesh);
      orbGroup.add(mesh);
    });

    function makeRing(radius, tiltX, tiltY, tiltZ) {
      const geo = new THREE.TorusGeometry(radius, 0.012, 8, 128);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x47b3ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(tiltX, tiltY, tiltZ);
      return ring;
    }

    const ringA = makeRing(2.15, 0, 0, 0);
    ringA.userData.speedFactor = 1.0;

    const ringB = makeRing(2.15, 0, Math.PI / 2, 0.15);
    ringB.userData.speedFactor = 1.8;

    orbGroup.add(ringA, ringB);

    function makeParticleShell(count, rMin, rMax, sizeVal, color) {
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = rMin + Math.random() * (rMax - rMin);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color, size: sizeVal, transparent: true, opacity: 0.85,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      });
      return new THREE.Points(geo, mat);
    }
    const shellDense = makeParticleShell(1200, 1.5, 2.05, 0.02, 0x66b0ff);
    orbGroup.add(shellDense);

    let currentZoom = 1.0;
    let raf;
    const animate = () => {
      const spd = speedRef.current;
      const zoomSens = zoomSensitivityRef.current;
      const boost = 1 + micLevelRef.current * 2.5;
      const gs = gestureRef.current;

      if (gs.type === 'spin' && gs.dx) {
        orbGroup.rotation.y += gs.dx * 3.2;
      } else {
        orbGroup.rotation.y += 0.003 * spd * boost;
      }

      if (gs.type === 'zoom' && gs.scaleDelta) {
        currentZoom = Math.max(0.6, Math.min(2.5, currentZoom + gs.scaleDelta * zoomSensitivityRef.current * 0.05));
      }

      spheres.forEach((s) => {
        s.rotation.y += s.userData.spin * spd * boost;
        const targetScale = s.userData.baseScale * boost * currentZoom;
        s.scale.set(targetScale, targetScale, targetScale);
      });

      ringA.rotation.z += 0.005 * spd * ringA.userData.speedFactor * boost;
      ringB.rotation.z -= 0.008 * spd * ringB.userData.speedFactor * boost;

      const t = performance.now() * 0.002 * spd;
      const coreScale = (1.4 + Math.sin(t) * 0.15) * boost * currentZoom;
      core.scale.setScalar(coreScale);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      if (renderer.domElement && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [size]);

  return <div ref={mountRef} style={{ width: size, height: size }} />;
}

function TypeLine({ text, speed = 30 }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    if (!text) return;
    const id = setInterval(() => {
      setN((prev) => {
        if (prev >= text.length) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const done = n >= text.length;
  return (
    <>
      {text.slice(0, n)}
      {!done && <span className="jv-caret">▍</span>}
    </>
  );
}

function ReminderWidget({ reminders, onAdd, onRemove }) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");

  const handleAdd = () => {
    if (text.trim() && time) {
      onAdd({ text: text.trim(), time });
      setText("");
      setTime("");
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.widgetLabel}>REMINDERS</div>
      <div style={styles.listContainer}>
        {reminders.length === 0 ? (
          <div style={styles.widgetSub}>No active reminders</div>
        ) : (
          reminders.map((item, idx) => (
            <div key={idx} style={styles.listItemRow}>
              <span style={styles.listItemText}>⏰ [{item.time}] {item.text}</span>
              <button style={styles.removeBtn} onClick={() => onRemove(idx)}>✕</button>
            </div>
          ))
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
        <input
          style={styles.widgetInput}
          placeholder="Reminder detail..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div style={{ display: "flex", gap: "6px" }}>
          <input
            style={{ ...styles.widgetInput, width: "90px" }}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button style={styles.widgetBtnSmall} onClick={handleAdd}>
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  );
}

function MathToolWidget() {
  const [mode, setMode] = useState("square");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const handleInputChange = (key, val) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const resetWidget = () => {
    setInputs({});
    setResult(null);
  };

  const calculate = () => {
    const getVal = (k) => parseFloat(inputs[k]) || 0;
    let res = [];

    if (mode === "square") {
      const s = getVal("side");
      res.push(`Area: ${s * s}`);
      res.push(`Perimeter: ${4 * s}`);
    } else if (mode === "rectangle") {
      const l = getVal("length");
      const w = getVal("width");
      res.push(`Area: ${l * w}`);
      res.push(`Perimeter: ${2 * (l + w)}`);
    } else if (mode === "circle") {
      const r = getVal("radius");
      const pie = 22 / 7;
      res.push(`Area: ${(pie * r * r).toFixed(2)}`);
      res.push(`Circumference: ${(2 * pie * r).toFixed(2)}`);
    } else if (mode === "triangle") {
      const s1 = getVal("s1");
      const s2 = getVal("s2");
      const s3 = getVal("s3");
      const hp = (s1 + s2 + s3) / 2;
      const area = Math.sqrt(hp * (hp - s1) * (hp - s2) * (hp - s3));
      res.push(`Perimeter: ${s1 + s2 + s3}`);
      res.push(`Area: ${isNaN(area) ? "Invalid Sides" : area.toFixed(2)}`);
    } else if (mode === "hcf_lcm") {
      const n1 = Math.abs(parseInt(getVal("n1"), 10));
      const n2 = Math.abs(parseInt(getVal("n2"), 10));
      const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
      const hcfVal = gcd(n1, n2);
      const lcmVal = hcfVal ? (n1 * n2) / hcfVal : 0;
      res.push(`HCF: ${hcfVal}`);
      res.push(`LCM: ${lcmVal}`);
    } else if (mode === "side_triangle") {
      const s1 = getVal("s1");
      const s2 = getVal("s2");
      const p = getVal("p");
      res.push(`Missing Side: ${p - (s1 + s2)}`);
    } else if (mode === "quadratic") {
      const a = getVal("a");
      const b = getVal("b");
      const c = getVal("c");
      if (a === 0) {
        res.push("A cannot be 0");
      } else {
        const d = b * b - 4 * a * c;
        if (d >= 0) {
          const x1 = (-b + Math.sqrt(d)) / (2 * a);
          const x2 = (-b - Math.sqrt(d)) / (2 * a);
          res.push(`X1: ${x1.toFixed(2)}`);
          res.push(`X2: ${x2.toFixed(2)}`);
        } else {
          const real = (-b / (2 * a)).toFixed(2);
          const imag = (Math.sqrt(-d) / (2 * a)).toFixed(2);
          res.push(`X1: ${real} + ${imag}i`);
          res.push(`X2: ${real} - ${imag}i`);
        }
      }
    } else if (mode === "ap") {
      const a = getVal("a");
      const d = getVal("d");
      const n = getVal("n");
      const sum = (n / 2) * (2 * a + (n - 1) * d);
      const term = a + (n - 1) * d;
      res.push(`Nth Term: ${term}`);
      res.push(`Sum N Terms: ${sum}`);
    } else if (mode === "basic") {
      const n1 = getVal("n1");
      const n2 = getVal("n2");
      const op = inputs["op"] || "+";
      if (op === "+") res.push(`Sum: ${n1 + n2}`);
      if (op === "-") res.push(`Diff: ${n1 - n2}`);
      if (op === "*") res.push(`Prod: ${n1 * n2}`);
      if (op === "/") res.push(`Div: ${n2 !== 0 ? (n1 / n2).toFixed(2) : "Error"}`);
      if (op === "^") res.push(`Power: ${Math.pow(n1, n2)}`);
    }

    setResult(res);
  };

  return (
    <div style={styles.widget}>
      <div style={styles.widgetRowBetween}>
        <div style={styles.widgetLabel}>MATH SOLVER</div>
        <button style={styles.widgetCancelBtn} onClick={resetWidget}>
          Reset
        </button>
      </div>

      <select
        style={{ ...styles.widgetInput, marginTop: "6px" }}
        value={mode}
        onChange={(e) => {
          setMode(e.target.value);
          resetWidget();
        }}
      >
        <option value="square">Square</option>
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="triangle">Triangle Area</option>
        <option value="side_triangle">Find Triangle Side</option>
        <option value="hcf_lcm">HCF & LCM</option>
        <option value="basic">Basic Math (+,-,*,/,^)</option>
        <option value="quadratic">Quadratic Eq (ax²+bx+c)</option>
        <option value="ap">Arithmetic Prog. (AP)</option>
      </select>

      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {mode === "square" && (
          <input
            style={styles.widgetInput}
            type="number"
            placeholder="Side length"
            value={inputs["side"] || ""}
            onChange={(e) => handleInputChange("side", e.target.value)}
          />
        )}

        {mode === "rectangle" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Length"
              value={inputs["length"] || ""}
              onChange={(e) => handleInputChange("length", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Width"
              value={inputs["width"] || ""}
              onChange={(e) => handleInputChange("width", e.target.value)}
            />
          </>
        )}

        {mode === "circle" && (
          <input
            style={styles.widgetInput}
            type="number"
            placeholder="Radius"
            value={inputs["radius"] || ""}
            onChange={(e) => handleInputChange("radius", e.target.value)}
          />
        )}

        {mode === "triangle" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Side 1"
              value={inputs["s1"] || ""}
              onChange={(e) => handleInputChange("s1", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Side 2"
              value={inputs["s2"] || ""}
              onChange={(e) => handleInputChange("s2", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Side 3"
              value={inputs["s3"] || ""}
              onChange={(e) => handleInputChange("s3", e.target.value)}
            />
          </>
        )}

        {mode === "side_triangle" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Side 1"
              value={inputs["s1"] || ""}
              onChange={(e) => handleInputChange("s1", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Side 2"
              value={inputs["s2"] || ""}
              onChange={(e) => handleInputChange("s2", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Total Perimeter"
              value={inputs["p"] || ""}
              onChange={(e) => handleInputChange("p", e.target.value)}
            />
          </>
        )}

        {mode === "hcf_lcm" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Num 1"
              value={inputs["n1"] || ""}
              onChange={(e) => handleInputChange("n1", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Num 2"
              value={inputs["n2"] || ""}
              onChange={(e) => handleInputChange("n2", e.target.value)}
            />
          </>
        )}

        {mode === "basic" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Num 1"
              value={inputs["n1"] || ""}
              onChange={(e) => handleInputChange("n1", e.target.value)}
            />
            <select
              style={styles.widgetInput}
              value={inputs["op"] || "+"}
              onChange={(e) => handleInputChange("op", e.target.value)}
            >
              <option value="+">+</option>
              <option value="-">-</option>
              <option value="*">*</option>
              <option value="/">/</option>
              <option value="^">^ (Power)</option>
            </select>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Num 2"
              value={inputs["n2"] || ""}
              onChange={(e) => handleInputChange("n2", e.target.value)}
            />
          </>
        )}

        {mode === "quadratic" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Value A"
              value={inputs["a"] || ""}
              onChange={(e) => handleInputChange("a", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Value B"
              value={inputs["b"] || ""}
              onChange={(e) => handleInputChange("b", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Value C"
              value={inputs["c"] || ""}
              onChange={(e) => handleInputChange("c", e.target.value)}
            />
          </>
        )}

        {mode === "ap" && (
          <>
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="First term (A)"
              value={inputs["a"] || ""}
              onChange={(e) => handleInputChange("a", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Diff (D)"
              value={inputs["d"] || ""}
              onChange={(e) => handleInputChange("d", e.target.value)}
            />
            <input
              style={styles.widgetInput}
              type="number"
              placeholder="Terms (N)"
              value={inputs["n"] || ""}
              onChange={(e) => handleInputChange("n", e.target.value)}
            />
          </>
        )}

        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
          <button style={{ ...styles.widgetBtnSmall, flex: 1 }} onClick={calculate}>
            Solve
          </button>
        </div>

        {result && (
          <div style={{ marginTop: "6px", padding: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "4px" }}>
            {result.map((line, i) => (
              <div key={i} style={{ ...styles.widgetSub, color: "#7CFFC4", fontWeight: 600 }}>
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const WEATHER_CODES = {
  0: "clear sky", 1: "mostly clear", 2: "partly cloudy", 3: "overcast",
  45: "foggy", 48: "foggy", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  61: "light rain", 63: "rain", 65: "heavy rain", 71: "light snow", 73: "snow",
  75: "heavy snow", 80: "rain showers", 81: "rain showers", 82: "violent rain showers",
  95: "thunderstorms", 96: "thunderstorms with hail", 99: "severe thunderstorms",
};

const WEATHER_ICONS = {
  0: "☀️", 1: "🌤", 2: "⛅", 3: "☁️", 45: "🌫", 48: "🌫",
  51: "🌦", 53: "🌦", 55: "🌧", 61: "🌦", 63: "🌧", 65: "🌧",
  71: "🌨", 73: "🌨", 75: "❄️", 80: "🌦", 81: "🌧", 82: "⛈",
  95: "⛈", 96: "⛈", 99: "⛈",
};

function TimeWidget() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={styles.widget}>
      <div style={styles.widgetLabel}>LOCAL TIME</div>
      <div style={styles.widgetBig}>
        {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </div>
      <div style={styles.widgetSub}>
        {now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
      </div>
    </div>
  );
}

function TimerWidget({ timer, onCancel, onFinish }) {
  const [remaining, setRemaining] = useState(0);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!timer) {
      finishedRef.current = false;
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0 && !finishedRef.current) {
        finishedRef.current = true;
        if (onFinish) onFinish(timer);
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [timer, onFinish]);

  if (!timer) {
    return (
      <div style={styles.widget}>
        <div style={styles.widgetLabel}>TIMER</div>
        <div style={styles.widgetSub}>No active timer</div>
      </div>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const formatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div style={{ ...styles.widget, borderColor: remaining === 0 ? "#FF5FA0" : "#FF9B42" }}>
      <div style={styles.widgetLabel}>TIMER</div>
      <div style={{ ...styles.widgetBig, color: remaining === 0 ? "#FF5FA0" : "#FF9B42" }}>
        ⏳ {remaining === 0 ? "00:00 - TIME UP!" : formatted}
      </div>
      <div style={styles.widgetRowBetween}>
        <span style={styles.widgetSub}>{timer.label || "Countdown"}</span>
        <button style={styles.widgetCancelBtn} onClick={onCancel}>
          Clear
        </button>
      </div>
    </div>
  );
}

function AlarmWidget({ alarm, onCancel }) {
  if (!alarm) {
    return (
      <div style={styles.widget}>
        <div style={styles.widgetLabel}>ALARM</div>
        <div style={styles.widgetSub}>No alarm set</div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.widget, borderColor: "#7CFFC4" }}>
      <div style={styles.widgetLabel}>ALARM</div>
      <div style={{ ...styles.widgetBig, color: "#7CFFC4" }}>⏰ {alarm.timeString}</div>
      <div style={styles.widgetRowBetween}>
        <span style={styles.widgetSub}>{alarm.label || "Scheduled"}</span>
        <button style={styles.widgetCancelBtn} onClick={onCancel}>
          Clear
        </button>
      </div>
    </div>
  );
}

function TodoWidget({ todos, onAdd, onRemove }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.widgetLabel}>TO-DO LIST</div>
      <div style={styles.listContainer}>
        {todos.length === 0 ? (
          <div style={styles.widgetSub}>No tasks pending</div>
        ) : (
          todos.map((item, idx) => (
            <div key={idx} style={styles.listItemRow}>
              <span style={styles.listItemText}>• {item}</span>
              <button style={styles.removeBtn} onClick={() => onRemove(idx)}>✕</button>
            </div>
          ))
        )}
      </div>
      <div style={styles.widgetRow}>
        <input
          style={styles.widgetInput}
          placeholder="Add task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button style={{ ...styles.widgetBtnSmall, cursor: "pointer" }} onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}

function AgendaWidget({ agenda, onAdd, onRemove }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim());
      setInput("");
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.widgetLabel}>AGENDA</div>
      <div style={styles.listContainer}>
        {agenda.length === 0 ? (
          <div style={styles.widgetSub}>No upcoming events</div>
        ) : (
          agenda.map((item, idx) => (
            <div key={idx} style={styles.listItemRow}>
              <span style={styles.listItemText}>📅 {item}</span>
              <button style={styles.removeBtn} onClick={() => onRemove(idx)}>✕</button>
            </div>
          ))
        )}
      </div>
      <div style={styles.widgetRow}>
        <input
          style={styles.widgetInput}
          placeholder="Add event..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button style={{ ...styles.widgetBtnSmall, cursor: "pointer" }} onClick={handleAdd}>Add</button>
      </div>
    </div>
  );
}

function WeatherWidget() {
  const [state, setState] = useState({ status: "loading" });
  const [cityInput, setCityInput] = useState("");

  const fetchByCoords = async (latitude, longitude, cancelledRef) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
      );
      const data = await res.json();
      if (cancelledRef.current) return;
      const temp = data?.current?.temperature_2m;
      const code = data?.current?.weather_code;
      if (temp === undefined) throw new Error("no data");
      setState({
        status: "ready",
        temp: Math.round(temp),
        desc: WEATHER_CODES[code] || "unknown",
        icon: WEATHER_ICONS[code] || "🌡",
      });
    } catch (e) {
      if (!cancelledRef.current)
        setState({ status: "error", message: `Fetch failed: ${e.message}` });
    }
  };

  useEffect(() => {
    const cancelledRef = { current: false };

    const savedCity = localStorage.getItem("jv_weather_city");
    const savedLat = localStorage.getItem("jv_weather_lat");
    const savedLon = localStorage.getItem("jv_weather_lon");
    if (savedCity && savedLat && savedLon) {
      fetchByCoords(savedLat, savedLon, cancelledRef);
      const id = setInterval(
        () => fetchByCoords(savedLat, savedLon, cancelledRef),
        15 * 60 * 1000
      );
      return () => {
        cancelledRef.current = true;
        clearInterval(id);
      };
    }

    const fetchWeather = () => {
      if (!navigator.geolocation) {
        setState({ status: "error", message: "No location access" });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude, cancelledRef),
        (err) => {
          const codes = { 1: "Permission denied", 2: "Position unavailable", 3: "Timed out" };
          if (!cancelledRef.current)
            setState({
              status: "error",
              message: `${codes[err.code] || "Unknown error"} (${err.message || err.code})`,
            });
        },
        { timeout: 15000 }
      );
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, []);

  const setManualCity = async () => {
    const name = cityInput.trim();
    if (!name) return;
    setState({ status: "loading" });
    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`
      );
      const geoData = await geoRes.json();
      const hit = geoData?.results?.[0];
      if (!hit) {
        setState({ status: "error", message: `Couldn't find "${name}"` });
        return;
      }
      localStorage.setItem("jv_weather_city", hit.name);
      localStorage.setItem("jv_weather_lat", hit.latitude);
      localStorage.setItem("jv_weather_lon", hit.longitude);
      const cancelledRef = { current: false };
      fetchByCoords(hit.latitude, hit.longitude, cancelledRef);
    } catch (e) {
      setState({ status: "error", message: "Lookup failed" });
    }
  };

  return (
    <div style={styles.widget}>
      <div style={styles.widgetLabel}>WEATHER</div>
      {state.status === "loading" && <div style={styles.widgetSub}>Locating…</div>}
      {state.status === "error" && (
        <>
          <div style={styles.widgetSub}>{state.message}</div>
          <div style={styles.widgetRow}>
            <input
              style={styles.widgetInput}
              placeholder="Enter city…"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setManualCity()}
            />
            <button style={styles.widgetBtnSmall} onClick={setManualCity}>
              Set
            </button>
          </div>
        </>
      )}
      {state.status === "ready" && (
        <>
          <div style={styles.widgetBig}>
            {state.icon} {state.temp}°C
          </div>
          <div style={styles.widgetSub}>{state.desc}</div>
        </>
      )}
    </div>
  );
}

function Jarvis() {
  const [fingerprintEnabled, setFingerprintEnabled] = useState(() => {
    return localStorage.getItem("jv_fingerprint_disabled") !== "true";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("jv_fingerprint_disabled") === "true";
  });

  const [currentBg, setCurrentBg] = useState(jarvisBg);

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hey! What's up?" },
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [voiceOn, setVoiceOn] = useState(true);
  const [micSupported, setMicSupported] = useState(true);
  const [orbSpeed, setOrbSpeed] = useState(1.0);
  const [zoomSensitivity, setZoomSensitivity] = useState(2.0);
  const [blobScreenPos, setBlobScreenPos] = useState({ leftPct: 50, topPct: 50 });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [voiceRate, setVoiceRate] = useState(0.92);
  const [voicePitch, setVoicePitch] = useState(0.75);

  const [gesturesActive, setGesturesActive] = useState(false);
  const [gestureStatus, setGestureStatus] = useState("NO HANDS");
  const [gestureState, setGestureState] = useState({ type: null });

  const webcamRef = useRef(null);
  const handsModelRef = useRef(null);
  const lastWristRef = useRef(null);
  const lastHandDistRef = useRef(null);

  const [activeTimer, setActiveTimer] = useState(null);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [todos, setTodos] = useState(["Review system diagnostics", "Calibrate voice synthesis"]);
  const [agenda, setAgenda] = useState(["10:00 AM - System Scan", "03:00 PM - Neural Sync"]);
  const [reminders, setReminders] = useState([
    { text: "Call back security team", time: "14:00" }
  ]);

  useEffect(() => {
    const recompute = () => {
      setBlobScreenPos({ leftPct: 50, topPct: 50 });
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  const [chatOpen, setChatOpen] = useState(false);
  const [widgetsOpen, setWidgetsOpen] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const logEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceOnRef = useRef(voiceOn);
  const audioCtxRef = useRef(null);
  const micStreamRef = useRef(null);
  const micRafRef = useRef(null);

  useEffect(() => {
    let stream = null;
    let animId = null;

    if (!gesturesActive) {
      setGestureStatus("NO HANDS");
      setGestureState({ type: null });
      return;
    }

    const initHandsAndCamera = async () => {
      try {
        if (!handsModelRef.current) {
          const HandsConstructor = window.Hands;
          if (HandsConstructor) {
            const hands = new HandsConstructor({
              locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
            });
            hands.setOptions({
              maxNumHands: 2,
              modelComplexity: 1,
              minDetectionConfidence: 0.6,
              minTrackingConfidence: 0.6,
            });
            hands.onResults((results) => {
              const handsList = results.multiHandLandmarks || [];
              if (handsList.length === 0) {
                setGestureStatus("NO HANDS");
                lastWristRef.current = null;
                lastHandDistRef.current = null;
                setGestureState({ type: null });
                return;
              }
              if (handsList.length === 1) {
                setGestureStatus("1 HAND · SPIN");
                const wrist = handsList[0][0];
                if (lastWristRef.current) {
                  const dx = wrist.x - lastWristRef.current.x;
                  setGestureState({ type: "spin", dx });
                }
                lastWristRef.current = { x: wrist.x, y: wrist.y };
                lastHandDistRef.current = null;
              } else {
                setGestureStatus("2 HANDS · ZOOM");
                const a = handsList[0][0], b = handsList[1][0];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (lastHandDistRef.current != null) {
                  const scaleDelta = (dist - lastHandDistRef.current) * 2;
                  setGestureState({ type: "zoom", scaleDelta });
                }
                lastHandDistRef.current = dist;
                lastWristRef.current = null;
              }
            });
            handsModelRef.current = hands;
          }
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240 }
        });

        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          await webcamRef.current.play();

          const sendFrame = async () => {
            if (webcamRef.current && handsModelRef.current && gesturesActive) {
              if (webcamRef.current.readyState >= 2) {
                await handsModelRef.current.send({ image: webcamRef.current });
              }
              animId = requestAnimationFrame(sendFrame);
            }
          };
          sendFrame();
        }
      } catch (err) {
        setGestureStatus("CAMERA ERROR");
      }
    };

    initHandsAndCamera();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [gesturesActive]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMicSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setStatus("idle");
      setTimeout(() => sendRef.current(transcript), 150);
    };
    recognition.onerror = () => setStatus("idle");
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "idle" : s));
    };

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        toggleListening();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status]);

  const toggleFingerprintAuth = () => {
    if (fingerprintEnabled) {
      localStorage.setItem("jv_fingerprint_disabled", "true");
      setFingerprintEnabled(false);
    } else {
      localStorage.removeItem("jv_fingerprint_disabled");
      setFingerprintEnabled(true);
    }
  };

  useEffect(() => {
    voiceOnRef.current = voiceOn;
    if (!voiceOn) window.speechSynthesis?.cancel();
  }, [voiceOn]);

  useEffect(() => {
    let cancelled = false;

    const stopMeter = () => {
      cancelAnimationFrame(micRafRef.current);
      micStreamRef.current?.getTracks().forEach((tr) => tr.stop());
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      micStreamRef.current = null;
      setMicLevel(0);
    };

    const startMeter = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        micStreamRef.current = stream;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / data.length);
          setMicLevel(Math.min(1, rms * 4));
          micRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch (e) {
        // mic error
      }
    };

    if (status === "listening" || status === "speaking") startMeter();
    else stopMeter();

    return () => {
      cancelled = true;
      stopMeter();
    };
  }, [status]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const speak = (text) => {
    if (!voiceOnRef.current || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = voiceRate;
    utter.pitch = voicePitch;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) =>
      /Daniel|Oliver|Arthur|Google UK English Male|en-GB/i.test(v.name)
    ) || voices.find((v) => v.lang.includes("en-GB"));

    if (preferred) utter.voice = preferred;
    utter.onstart = () => setStatus("speaking");
    utter.onend = () => setStatus((s) => (s === "speaking" ? "idle" : s));
    window.speechSynthesis.speak(utter);
  };

  const handleTimerFinish = (timer) => {
    const alertMsg = `Time is up! Your timer for ${timer.label || "countdown"} has ended.`;
    setMessages((prev) => [...prev, { role: "assistant", text: alertMsg }]);
    if (voiceOnRef.current) speak(alertMsg);
  };

  const toggleListening = () => {
    if (!micSupported) return;
    if (status === "listening") {
      recognitionRef.current?.stop();
      setStatus("idle");
      return;
    }
    window.speechSynthesis?.cancel();
    try {
      recognitionRef.current?.start();
      setStatus("listening");
    } catch (e) {
      // recognition active
    }
  };

  const SITE_MAP = {
    youtube: "https://youtube.com",
    gmail: "https://mail.google.com",
    email: "https://mail.google.com",
    google: "https://google.com",
    chrome: "https://google.com",
    github: "https://github.com",
    wikipedia: "https://wikipedia.org",
    twitter: "https://x.com",
    x: "https://x.com",
    reddit: "https://reddit.com",
    amazon: "https://amazon.com",
    netflix: "https://www.netflix.com",
    hotstar: "https://www.jiohotstar.com",
    jiohotstar: "https://www.jiohotstar.com",
    "prime video": "https://www.primevideo.com",
    prime: "https://www.primevideo.com",
    sonyliv: "https://www.sonyliv.com",
    zee5: "https://www.zee5.com",
    maps: "https://maps.google.com",
    "google maps": "https://maps.google.com",
    translate: "https://translate.google.com",
    drive: "https://drive.google.com",
    chatgpt: "https://chat.openai.com",
    claude: "https://claude.ai",
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    news: "https://news.google.com",
    weather: "https://weather.com",
  };

  const tryOpenCommand = async (text) => {
    const match = text.match(
      /^(?:please\s+)?(?:open|launch|go to|pull up)\s+(.+?)[.!]?$/i
    );
    if (!match) return { handled: false };

    const raw = match[1].trim();
    const key = raw.toLowerCase().replace(/^the\s+/, "");

    if (["whatsapp", "calculator", "notes", "terminal"].includes(key)) {
      try {
        const targetApp = key === "whatsapp" ? "whatsapp" : key;
        const res = await fetch("http://localhost:3001/api/open-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName: targetApp }),
        });
        const data = await res.json();
        if (data.success) {
          return { handled: true, reply: `Opening ${raw}.` };
        }
      } catch (e) {
        // Fallback
      }
    }

    if (["downloads", "download", "desktop", "documents", "jarvis app"].includes(key)) {
      let targetPath = `/Users/yaanisdua/${key.charAt(0).toUpperCase() + key.slice(1)}`;
      if (key === "downloads" || key === "download") targetPath = "/Users/yaanisdua/Downloads";
      if (key === "desktop") targetPath = "/Users/yaanisdua/Desktop";
      if (key === "documents") targetPath = "/Users/yaanisdua/Documents";

      try {
        await fetch("http://localhost:3001/api/open-app", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appName: targetPath }),
        });
        return { handled: true, reply: `Opening folder: ${targetPath}` };
      } catch (e) {
        // Fallback
      }
    }

    let url = SITE_MAP[key];
    let label = raw;

    if (!url) {
      const looksLikeDomain = /^[\w-]+(\.[\w-]+)+([/?#].*)?$/i.test(raw);
      if (looksLikeDomain) {
        url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      }
    }

    if (!url) {
      url = `https://www.google.com/search?q=${encodeURIComponent(raw)}`;
      window.open(url, "_blank", "noopener,noreferrer");
      return {
        handled: true,
        reply: `I don't have a direct link for "${label}," so I've pulled up a search for it instead.`,
      };
    }

    window.open(url, "_blank", "noopener,noreferrer");
    return { handled: true, reply: `Opening ${label}.` };
  };

  const evalMath = (expr) => {
    let i = 0;
    const skip = () => {
      while (expr[i] === " ") i++;
    };
    const parseNum = () => {
      skip();
      let start = i;
      if (expr[i] === "-") i++;
      while (/[0-9.]/.test(expr[i])) i++;
      if (i === start) throw new Error("bad number");
      return parseFloat(expr.slice(start, i));
    };
    const parseFactor = () => {
      skip();
      if (expr[i] === "(") {
        i++;
        const v = parseExpr();
        skip();
        if (expr[i] !== ")") throw new Error("missing )");
        i++;
        return v;
      }
      return parseNum();
    };
    const parseTerm = () => {
      let v = parseFactor();
      skip();
      while (expr[i] === "*" || expr[i] === "/" || expr[i] === "x" || expr[i] === "×") {
        const op = expr[i];
        i++;
        const rhs = parseFactor();
        v = op === "/" ? v / rhs : v * rhs;
        skip();
      }
      return v;
    };
    const parseExpr = () => {
      let v = parseTerm();
      skip();
      while (expr[i] === "+" || expr[i] === "-") {
        const op = expr[i];
        i++;
        const rhs = parseTerm();
        v = op === "+" ? v + rhs : v - rhs;
        skip();
      }
      return v;
    };
    const result = parseExpr();
    skip();
    if (i !== expr.length) throw new Error("trailing input");
    return result;
  };

  const tryLocalCommand = async (text) => {
    const t = text.trim().toLowerCase();

    if (t.includes("panter") || t.includes("black panther") || t.includes("change background to panther")) {
      setCurrentBg(pantherBg);
      return "Background switched to Black Panther protocol.";
    }
    if (t.includes("avengers") || t.includes("change background to avengers")) {
      setCurrentBg(avengersBg);
      return "Background switched to Avengers protocol.";
    }
    if (t.includes("iron man") || t.includes("ironman") || t.includes("change background to iron man")) {
      setCurrentBg(ironmanBg);
      return "Background switched to Iron Man protocol.";
    }
    if (t.includes("reactor") || t.includes("arc reactor") || t.includes("change background to reactor")) {
      setCurrentBg(reactorBg);
      return "Background switched to Arc Reactor protocol.";
    }
    if (t.includes("default") || t.includes("original background")) {
      setCurrentBg(jarvisBg);
      return "Restoring default HUD background.";
    }

    const reminderAddMatch = t.match(/(?:remind me to|set a reminder for)\s+(.+?)\s+(?:at|for)\s+(.+)/i);
    if (reminderAddMatch) {
      const remText = reminderAddMatch[1];
      const remTime = reminderAddMatch[2];
      setReminders((prev) => [...prev, { text: remText, time: remTime }]);
      return `Reminder set for ${remTime}: "${remText}".`;
    }

    if (/\b(?:clear|empty)\s+(?:my\s+)?reminders?\b/i.test(t)) {
      setReminders([]);
      return "Reminders cleared.";
    }

    const todoAddMatch = t.match(/(?:add|put)\s+(.+?)\s+(?:to|on)\s+(?:my\s+)?to-?do\s*(?:list)?/i);
    if (todoAddMatch) {
      const task = todoAddMatch[1];
      setTodos((prev) => [...prev, task]);
      return `Added "${task}" to your to-do list.`;
    }

    if (/\b(?:clear|empty)\s+(?:my\s+)?to-?do\s*(?:list)?\b/i.test(t)) {
      setTodos([]);
      return "To-do list cleared.";
    }

    const agendaAddMatch = t.match(/(?:add|put)\s+(.+?)\s+(?:to|on)\s+(?:my\s+)?agenda/i);
    if (agendaAddMatch) {
      const event = agendaAddMatch[1];
      setAgenda((prev) => [...prev, event]);
      return `Added "${event}" to your agenda.`;
    }

    if (/\b(?:clear|empty)\s+(?:my\s+)?agenda\b/i.test(t)) {
      setAgenda([]);
      return "Agenda cleared.";
    }

    const isTimerCommand = /\btimer\b/i.test(t);
    const timeNumMatch = t.match(/(\d+)\s*(m|min|minute|s|sec|second|h|hour)s?/i);

    if (isTimerCommand && timeNumMatch) {
      const amount = parseInt(timeNumMatch[1], 10);
      const unitRaw = timeNumMatch[2];
      let durationMs = amount * 1000;
      let unitLabel = "second";

      if (unitRaw.startsWith("m")) {
        durationMs = amount * 60 * 1000;
        unitLabel = "minute";
      } else if (unitRaw.startsWith("h")) {
        durationMs = amount * 3600 * 1000;
        unitLabel = "hour";
      }

      const endTime = Date.now() + durationMs;
      setActiveTimer({ endTime, label: `${amount} ${unitLabel}` });
      return `Timer set for ${amount} ${unitLabel}${amount > 1 ? "s" : ""}.`;
    }

    if (activeTimer && /(?:change|update|set|make)\s+(?:it|timer)?\s*(?:to|for)?\s*(\d+)\s*(m|min|minute|s|sec|second|h|hour)s?/i.test(t)) {
      const updateMatch = t.match(/(\d+)\s*(m|min|minute|s|sec|second|h|hour)s?/i);
      if (updateMatch) {
        const amount = parseInt(updateMatch[1], 10);
        const unitRaw = updateMatch[2];
        let durationMs = amount * 1000;
        let unitLabel = "second";

        if (unitRaw.startsWith("m")) {
          durationMs = amount * 60 * 1000;
          unitLabel = "minute";
        } else if (unitRaw.startsWith("h")) {
          durationMs = amount * 3600 * 1000;
          unitLabel = "hour";
        }

        const endTime = Date.now() + durationMs;
        setActiveTimer({ endTime, label: `${amount} ${unitLabel}` });
        return `Timer updated to ${amount} ${unitLabel}${amount > 1 ? "s" : ""}.`;
      }
    }

    if (/\b(cancel|stop|clear|delete)\s+timer\b/i.test(t)) {
      setActiveTimer(null);
      return "Timer cancelled.";
    }

    const isAlarmCommand = /\balarm\b/i.test(t);
    const alarmTimeMatch = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);

    if (isAlarmCommand && alarmTimeMatch) {
      let hours = parseInt(alarmTimeMatch[1], 10);
      const mins = alarmTimeMatch[2] ? alarmTimeMatch[2] : "00";
      const ampm = alarmTimeMatch[3] ? alarmTimeMatch[3].toUpperCase() : "";

      const timeString = `${hours}:${mins} ${ampm}`.trim();
      setActiveAlarm({ timeString, label: "Alarm" });
      return `Alarm set for ${timeString}.`;
    }

    if (/\b(cancel|stop|clear|delete)\s+alarm\b/i.test(t)) {
      setActiveAlarm(null);
      return "Alarm cleared.";
    }

    if (/\btime\b/.test(t) && !/\btimes\b|weather|watch/.test(t)) {
      const now = new Date();
      return `It's ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}.`;
    }

    const calcMatch = text.match(
      /^(?:calculate|what'?s|what is|compute)?\s*([\d\s()+\-*/x×.]+)\??$/i
    );
    if (calcMatch && /\d/.test(calcMatch[1]) && /[+\-*/x×]/.test(calcMatch[1])) {
      try {
        const cleaned = calcMatch[1].replace(/x|×/g, "*");
        const result = evalMath(cleaned);
        if (Number.isFinite(result)) {
          const rounded = Math.round(result * 10000) / 10000;
          return `That's ${rounded}.`;
        }
      } catch (e) {
        // fall through
      }
    }

    if (/\bweather\b/.test(t) && !/^(?:please\s+)?open\b/.test(t)) {
      try {
        const { lat, lon } = await getLocation();
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius`
        );
        const data = await res.json();
        const temp = data?.current?.temperature_2m;
        const code = data?.current?.weather_code;
        const desc = WEATHER_CODES[code] || "conditions I can't place";
        if (temp !== undefined) {
          return `It's ${Math.round(temp)}°C with ${desc} right now.`;
        }
      } catch (e) {
        return "I couldn't get a location fix for weather.";
      }
    }

    return null;
  };

  const send = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text || status === "thinking") return;
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");

    const localReply = await tryLocalCommand(text);
    if (localReply) {
      setMessages((prev) => [...prev, { role: "assistant", text: localReply }]);
      if (voiceOnRef.current && window.speechSynthesis) {
        speak(localReply);
      } else {
        setStatus("idle");
      }
      return;
    }

    const fileMatch = text.match(/^(?:open\s+(?:file|folder)?|open)\s+(.+)$/i);
    if (fileMatch) {
      let targetPath = fileMatch[1].trim();
      const userHome = "/Users/yaanisdua";

      const lower = targetPath.toLowerCase().replace(/\bfolder/g, "").trim();
      if (lower === "desktop") targetPath = `${userHome}/Desktop`;
      else if (lower === "downloads" || lower === "download") targetPath = `${userHome}/Downloads`;
      else if (lower === "documents") targetPath = `${userHome}/Documents`;
      else if (lower === "jarvis app" || lower === "jarvis") targetPath = `${userHome}/Desktop/jarvis-app`;

      if (["desktop", "downloads", "download", "documents", "jarvis app", "jarvis"].includes(lower) || targetPath.startsWith("/")) {
        try {
          await fetch("http://localhost:3001/api/open-app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appName: targetPath }),
          });
          const reply = `Opening ${targetPath}.`;
          setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
          if (voiceOnRef.current && window.speechSynthesis) speak(reply);
          return;
        } catch (e) {
          // Fall back
        }
      }
    }

    const searchMatch =
      text.match(/(?:open|play|search)?\s*(?:on\s+)?(youtube|google|github|reddit)\s+(?:for|to|and\s+play)?\s*(.+)/i) ||
      text.match(/(?:play|search\s+for|find)\s+(.+?)\s+on\s+(youtube|google|github|reddit)/i);

    if (searchMatch) {
      let site = "youtube";
      let query = "";

      if (searchMatch[1].toLowerCase().includes("youtube")) {
        query = searchMatch[2] || "";
      } else if (searchMatch[2]?.toLowerCase().includes("youtube")) {
        query = searchMatch[1] || "";
      } else {
        site = searchMatch[1].toLowerCase();
        query = searchMatch[2] || searchMatch[1];
      }

      query = query
        .replace(/^(?:and\s+)?(?:play|search\s+for|find|open)\s+/i, "")
        .replace(/^please\s+/i, "")
        .trim();

      if (site === "youtube") {
        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " site:youtube.com/watch")}&btnI=1`;
        window.open(targetUrl, "_blank", "noopener,noreferrer");

        const reply = `Playing "${query}" on YouTube for you.`;
        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
        if (voiceOnRef.current && window.speechSynthesis) speak(reply);
        return;
      }

      const searchUrls = {
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        github: `https://github.com/search?q=${encodeURIComponent(query)}`,
        reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
      };

      const targetUrl = searchUrls[site] || `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(targetUrl, "_blank", "noopener,noreferrer");

      const reply = `Searching ${site} for "${query}".`;
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (voiceOnRef.current && window.speechSynthesis) speak(reply);
      return;
    }

    const openResult = await tryOpenCommand(text);
    if (openResult.handled) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: openResult.reply },
      ]);
      if (voiceOnRef.current && window.speechSynthesis) {
        speak(openResult.reply);
      } else {
        setStatus("idle");
      }
      return;
    }

    setStatus("thinking");

    try {
      const response = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are JARVIS, but you talk completely naturally like a casual, friendly human. Avoid robotic phrasing, formal disclaimers, or assistant-like filler. Keep replies concise, conversational, and down-to-earth.",
            },
            ...nextMessages.map((m) => ({
              role: m.role,
              content: m.text,
            })),
          ],
        }),
      });
      const data = await response.json();
      const reply =
        data?.choices?.[0]?.message?.content ?? "Hey! What's up?";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      if (voiceOnRef.current && window.speechSynthesis) {
        speak(reply);
      } else {
        setStatus("idle");
      }
    } catch (e) {
      const failMsg = "My bad, I hit a snag connecting to the backend. Try again?";
      setMessages((prev) => [...prev, { role: "assistant", text: failMsg }]);
      if (voiceOnRef.current && window.speechSynthesis) {
        speak(failMsg);
      } else {
        setStatus("idle");
      }
    }
  };

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  });

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (fingerprintEnabled && !isAuthenticated) {
    return <AuthGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ ...styles.root, backgroundImage: `url(${currentBg})` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@300;400;500;700;800&display=swap');

        * { box-sizing: border-box; }

        .jv-scroll::-webkit-scrollbar { width: 6px; }
        .jv-scroll::-webkit-scrollbar-thumb { background: #1f3745; border-radius: 3px; }
        .jv-scroll::-webkit-scrollbar-track { background: transparent; }

        @keyframes jv-rotate { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        @keyframes jv-rotate-rev { from { transform: rotate(360deg);} to { transform: rotate(0deg);} }
        @keyframes jv-pulse-idle { 0%,100% { opacity: .55; transform: scale(1);} 50% { opacity: .85; transform: scale(1.03);} }
        @keyframes jv-pulse-think { 0%,100% { opacity: .5; transform: scale(0.97);} 50% { opacity: 1; transform: scale(1.06);} }
        @keyframes jv-pulse-speak { 0%,100% { opacity: .7; transform: scale(1.0);} 50% { opacity: 1; transform: scale(1.1);} }
        @keyframes jv-fadeup { from { opacity: 0; transform: translateY(6px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes jv-blink { 0%,100% { opacity: 1;} 50% { opacity: .25;} }
        @keyframes jv-scan { 0% { transform: translateY(-100%);} 100% { transform: translateY(100%);} }

        .jv-msg { animation: jv-fadeup .35s ease both; }
        .jv-caret { animation: jv-blink 1s steps(1) infinite; }
      `}</style>

      <div style={styles.grid} />
      <div style={styles.vignette} />

      <div style={styles.floatingHeader}>
        <div style={styles.brandRow}>
          <span style={styles.brandMark}>◆</span>
          <span style={styles.brandText}>J·A·R·V·I·S</span>
        </div>

        <div style={styles.topCenterTitle}>
          J.A.R.V.I.S
        </div>

        <div style={styles.statusRow}>
          <span
            style={{
              ...styles.statusDot,
              background:
                status === "idle"
                  ? "#00f0ff"
                  : status === "listening"
                    ? "#ff007f"
                    : status === "thinking"
                      ? "#ffaa00"
                      : "#00ffcc",
              boxShadow:
                status === "idle"
                  ? "0 0 8px #00f0ff"
                  : status === "listening"
                    ? "0 0 8px #ff007f"
                    : status === "thinking"
                      ? "0 0 8px #ffaa00"
                      : "0 0 8px #00ffcc",
            }}
          />
          <span style={styles.statusText}>
            {status === "idle"
              ? "STANDBY"
              : status === "listening"
                ? "LISTENING"
                : status === "thinking"
                  ? "PROCESSING"
                  : "RESPONDING"}
          </span>
          <button
            style={styles.muteBtn}
            onClick={() => setVoiceOn((v) => !v)}
            title={voiceOn ? "Mute voice" : "Unmute voice"}
          >
            {voiceOn ? "🔊" : "🔇"}
          </button>
          <button
            style={styles.muteBtn}
            onClick={() => setSettingsOpen((s) => !s)}
            title="System Settings"
          >
            ⚙
          </button>
          <button
            style={styles.muteBtn}
            onClick={() => setChatOpen((c) => !c)}
            title={chatOpen ? "Close chat" : "Open chat"}
          >
            {chatOpen ? "✕" : "💬"}
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div style={styles.floatingSettings}>
          <div style={styles.settingsHeader}>
            <span style={{ color: "#00f0ff", fontWeight: 700, fontSize: "12px", letterSpacing: "1px" }}>
              SYSTEM CONTROL PANEL
            </span>
            <button style={styles.closeDrawerBtn} onClick={() => setSettingsOpen(false)}>✕</button>
          </div>

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Fingerprint Security Gate</label>
            <button
              style={{
                ...styles.widgetBtnSmall,
                background: fingerprintEnabled ? "#ff007f" : "#00ffcc",
                color: "#05080C",
              }}
              onClick={toggleFingerprintAuth}
            >
              {fingerprintEnabled ? "Disable Fingerprint Auth" : "Enable Fingerprint Auth"}
            </button>
          </div>

          <div style={styles.sliderDivider} />

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Orb Speed ({orbSpeed.toFixed(1)}x)</label>
            <input
              style={styles.slider}
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={orbSpeed}
              onChange={(e) => setOrbSpeed(Number(e.target.value))}
            />
          </div>

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Zoom Sensitivity ({zoomSensitivity.toFixed(1)}x)</label>
            <input
              style={styles.slider}
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={zoomSensitivity}
              onChange={(e) => setZoomSensitivity(Number(e.target.value))}
            />
          </div>

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Speech Speed ({voiceRate}x)</label>
            <input
              style={styles.slider}
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={voiceRate}
              onChange={(e) => setVoiceRate(Number(e.target.value))}
            />
          </div>

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Voice Pitch ({voicePitch})</label>
            <input
              style={styles.slider}
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={voicePitch}
              onChange={(e) => setVoicePitch(Number(e.target.value))}
            />
          </div>

          <div style={styles.sliderDivider} />

          <div style={styles.sliderRow}>
            <label style={styles.sliderLabel}>Security Credentials</label>
            <button
              style={styles.widgetBtnSmall}
              onClick={() => {
                localStorage.removeItem("jv_fingerprint_id");
                setIsAuthenticated(false);
              }}
            >
              Reset Credentials & Lock
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          ...styles.widgetDrawer,
          transform: widgetsOpen ? "translateX(0)" : "translateX(-110%)",
        }}
      >
        <div style={styles.drawerHeader}>
          <span style={styles.drawerTitle}>SYSTEM WIDGETS</span>
          <button style={styles.closeDrawerBtn} onClick={() => setWidgetsOpen(false)}>✕</button>
        </div>
        <div className="jv-scroll" style={styles.widgetStackInner}>
          <TimeWidget />
          <ReminderWidget
            reminders={reminders}
            onAdd={(rem) => setReminders((prev) => [...prev, rem])}
            onRemove={(idx) => setReminders((prev) => prev.filter((_, i) => i !== idx))}
          />
          <TimerWidget timer={activeTimer} onCancel={() => setActiveTimer(null)} onFinish={handleTimerFinish} />
          <AlarmWidget alarm={activeAlarm} onCancel={() => setActiveAlarm(null)} />
          <MathToolWidget />
          <TodoWidget
            todos={todos}
            onAdd={(task) => setTodos((prev) => [...prev, task])}
            onRemove={(idx) => setTodos((prev) => prev.filter((_, i) => i !== idx))}
          />
          <AgendaWidget
            agenda={agenda}
            onAdd={(event) => setAgenda((prev) => [...prev, event])}
            onRemove={(idx) => setAgenda((prev) => prev.filter((_, i) => i !== idx))}
          />
          <WeatherWidget />
        </div>
      </div>

      <div
        style={{
          ...styles.blobStage,
          left: `${blobScreenPos.leftPct}%`,
          top: `${blobScreenPos.topPct}%`,
        }}
      >
        <div style={styles.blobCircle}>
          <ThreeJarvisOrb size={260} micLevel={micLevel} speed={orbSpeed} zoomSensitivity={zoomSensitivity} gestureState={gestureState} />
        </div>

        <div style={styles.hudBr}>
          <div id="webcam-wrap" style={{ ...styles.webcamWrap, display: gesturesActive ? "block" : "none" }}>
            <video ref={webcamRef} autoPlay muted playsInline style={styles.webcam} />
            <div style={styles.gestureLabel}>{gestureStatus}</div>
          </div>
          <button
            style={{
              ...styles.rectChatBtn,
              background: gesturesActive ? "rgba(0,240,255,0.25)" : "rgba(5,15,30,0.85)",
              borderColor: "#00f0ff",
              color: "#00f0ff",
            }}
            onClick={() => setGesturesActive((v) => !v)}
          >
            {gesturesActive ? "GESTURES ON" : "GESTURES OFF"}
          </button>
        </div>

        <div style={styles.btnRowBelowCircles}>
          <button
            style={{
              ...styles.rectChatBtn,
              borderColor: widgetsOpen ? "#00ffcc" : "#00f0ff",
              color: widgetsOpen ? "#00ffcc" : "#00f0ff",
              boxShadow: widgetsOpen
                ? "0 0 20px rgba(0,255,204,0.6)"
                : "0 0 16px rgba(0,240,255,0.35)",
            }}
            onClick={() => setWidgetsOpen((w) => !w)}
          >
            {widgetsOpen ? "CLOSE WIDGETS" : "WIDGETS"}
          </button>

          {micSupported && (
            <button
              style={{
                ...styles.rectSpeakBtn,
                borderColor: status === "listening" ? "#ff007f" : "#00f0ff",
                color: status === "listening" ? "#ff007f" : "#00f0ff",
                boxShadow:
                  status === "listening"
                    ? "0 0 20px rgba(255,0,127,0.6)"
                    : "0 0 16px rgba(0,240,255,0.35)",
              }}
              onClick={toggleListening}
            >
              {status === "listening" ? "LISTENING..." : "PRESS TO SPEAK"}
            </button>
          )}

          <button
            style={{
              ...styles.rectChatBtn,
              borderColor: chatOpen ? "#00ffcc" : "#00f0ff",
              color: chatOpen ? "#00ffcc" : "#00f0ff",
              boxShadow: chatOpen
                ? "0 0 20px rgba(0,255,204,0.6)"
                : "0 0 16px rgba(0,240,255,0.35)",
            }}
            onClick={() => setChatOpen((c) => !c)}
          >
            PRESS TO CHAT
          </button>
        </div>
      </div>

      <div
        style={{
          ...styles.chatDrawer,
          transform: chatOpen ? "translateX(0)" : "translateX(110%)",
        }}
      >
        <div style={styles.termOuter}>
          <div className="jv-scroll" style={styles.termInner}>
            {messages.map((m, i) => {
              const isNewestAssistant =
                m.role === "assistant" && i === messages.length - 1;
              return (
                <div key={i} className="jv-msg" style={styles.termLine}>
                  <span style={styles.termPrefix}>
                    {m.role === "user" ? ">" : "JARVIS::"}
                  </span>
                  <span style={styles.termText}>
                    {isNewestAssistant ? (
                      <TypeLine text={m.text} />
                    ) : (
                      m.text
                    )}
                  </span>
                </div>
              );
            })}
            {status === "thinking" && (
              <div style={styles.termLine}>
                <span style={styles.termPrefix}>JARVIS::</span>
                <span style={styles.termText}>
                  <span className="jv-caret">▍</span>
                </span>
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        <div style={styles.inputRow}>
          <span style={styles.prompt}>{">"}</span>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              micSupported
                ? "Type, tap the mic, or say “open YouTube”…"
                : "Speak your command…"
            }
            autoFocus={chatOpen}
          />
          {micSupported && (
            <button
              style={{
                ...styles.micBtn,
                borderColor: status === "listening" ? "#ff007f" : "#00f0ff",
                color: status === "listening" ? "#ff007f" : "#00f0ff",
              }}
              onClick={toggleListening}
              title={status === "listening" ? "Stop listening" : "Voice input"}
            >
              {status === "listening" ? "■" : "●"}
            </button>
          )}
          <button
            style={{
              ...styles.sendBtn,
              opacity: input.trim() ? 1 : 0.4,
              cursor: input.trim() ? "pointer" : "default",
            }}
            onClick={() => send()}
            disabled={!input.trim() || status === "thinking"}
          >
            SEND
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 18px 12px 18px" }}>
          <button
            style={{
              ...styles.sendBtn,
              borderColor: "#ff007f",
              color: "#ff007f",
              cursor: "pointer",
              width: "100%",
            }}
            onClick={() => setMessages([{ role: "assistant", text: "Chat cleared. What's next?" }])}
            title="Clear chat history"
          >
            CLEAR CHAT
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    position: "relative",
    width: "100%",
    minHeight: "640px",
    height: "100%",
    background: "#030712",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    fontFamily: "'Sora', sans-serif",
    color: "#E0F2FE",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)",
    backgroundSize: "34px 34px",
    pointerEvents: "none",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at center, rgba(3,7,18,0) 40%, rgba(3,7,18,0.9) 100%)",
    pointerEvents: "none",
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 26px",
    background:
      "linear-gradient(180deg, rgba(3,7,18,0.75) 0%, rgba(3,7,18,0) 100%)",
    backdropFilter: "blur(6px)",
  },
  topCenterTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "36px",
    fontWeight: 800,
    letterSpacing: "14px",
    color: "#00f0ff",
    textShadow: "0 0 20px rgba(0, 240, 255, 0.8), 0 0 40px rgba(0, 240, 255, 0.4)",
    textAlign: "center",
    textTransform: "uppercase",
    padding: "10px 0",
  },
  blobStage: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    padding: 0,
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  btnRowBelowCircles: {
    marginTop: "20px",
    display: "flex",
    gap: "16px",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  },
  hudBr: {
    marginBottom: "14px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    pointerEvents: "auto",
  },
  webcamWrap: {
    position: "relative",
    width: "140px",
    height: "90px",
    overflow: "hidden",
    border: "1px solid #00f0ff",
    background: "#000",
    borderRadius: "6px",
  },
  webcam: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: "scaleX(-1)",
    opacity: 0.85,
  },
  gestureLabel: {
    position: "absolute",
    left: "4px",
    bottom: "2px",
    fontSize: "9px",
    letterSpacing: "1px",
    color: "#00f0ff",
    textShadow: "0 0 6px rgba(0,0,0,0.9)",
  },
  rectSpeakBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    background: "rgba(5,15,30,0.85)",
    border: "1.5px solid #00f0ff",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2.5px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    backdropFilter: "blur(4px)",
    transition: "all 0.2s ease",
  },
  rectChatBtn: {
    padding: "10px 22px",
    borderRadius: "8px",
    background: "rgba(5,15,30,0.85)",
    border: "1.5px solid #00f0ff",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2.5px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    backdropFilter: "blur(4px)",
    transition: "all 0.2s ease",
  },
  blobCircle: {
    width: "260px",
    height: "260px",
    borderRadius: "50%",
    overflow: "hidden",
    padding: 0,
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  floatingSettings: {
    position: "absolute",
    top: "78px",
    right: "22px",
    zIndex: 10,
    width: "280px",
    background: "rgba(8, 15, 28, 0.95)",
    border: "1px solid #00f0ff",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px 20px",
    borderRadius: "10px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
  },
  settingsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "8px",
    borderBottom: "1px solid #00f0ff",
  },
  widgetDrawer: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "min(320px, 85vw)",
    zIndex: 4,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "84px 16px 16px",
    background: "linear-gradient(180deg, #030712 0%, #050B14 100%)",
    borderRight: "1px solid #00f0ff",
    boxShadow: "20px 0 50px -20px rgba(0,0,0,0.7)",
    transition: "transform 0.32s ease",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: "8px",
    borderBottom: "1px solid #00f0ff",
  },
  drawerTitle: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    letterSpacing: "2px",
    color: "#00f0ff",
    fontWeight: 700,
  },
  closeDrawerBtn: {
    background: "transparent",
    border: "none",
    color: "#ff007f",
    fontSize: "14px",
    cursor: "pointer",
  },
  widgetStackInner: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    height: "100%",
    overflowY: "auto",
    paddingRight: "4px",
  },
  widget: {
    background: "rgba(5, 15, 30, 0.6)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(0, 240, 255, 0.3)",
    borderRadius: "10px",
    padding: "12px 14px",
    boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6)",
  },
  widgetLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#38bdf8",
    marginBottom: "4px",
  },
  widgetBig: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "18px",
    fontWeight: 600,
    color: "#E0F2FE",
  },
  widgetSub: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "12px",
    color: "#93c5fd",
    marginTop: "2px",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    margin: "6px 0",
    maxHeight: "100px",
    overflowY: "auto",
  },
  listItemRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "rgba(255,255,255,0.04)",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  listItemText: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "11px",
    color: "#E0F2FE",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "140px",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#ff007f",
    fontSize: "11px",
    cursor: "pointer",
    padding: "0 2px",
  },
  widgetRowBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "4px",
  },
  widgetCancelBtn: {
    background: "transparent",
    border: "1px solid #ff007f",
    color: "#ff007f",
    borderRadius: "4px",
    fontSize: "10px",
    padding: "2px 6px",
    cursor: "pointer",
  },
  widgetRow: {
    display: "flex",
    gap: "6px",
    marginTop: "8px",
  },
  widgetInput: {
    flex: 1,
    minWidth: 0,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(0, 240, 255, 0.3)",
    borderRadius: "6px",
    color: "#E0F2FE",
    fontSize: "12px",
    padding: "5px 8px",
    outline: "none",
  },
  widgetBtnSmall: {
    background: "#00f0ff",
    border: "none",
    color: "#030712",
    fontWeight: 700,
    fontSize: "11px",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  chatDrawer: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: "min(380px, 92vw)",
    zIndex: 4,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "84px 16px 16px",
    background: "linear-gradient(180deg, #030712 0%, #050B14 100%)",
    borderLeft: "1px solid #00f0ff",
    boxShadow: "-20px 0 50px -20px rgba(0,0,0,0.7)",
    transition: "transform 0.32s ease",
  },
  brandRow: { display: "flex", alignItems: "center", gap: "8px" },
  brandMark: { color: "#00f0ff", fontSize: "12px" },
  brandText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    letterSpacing: "3px",
    fontWeight: 500,
    color: "#E0F2FE",
  },
  statusRow: { display: "flex", alignItems: "center", gap: "6px" },
  statusDot: { width: "6px", height: "6px", borderRadius: "50%" },
  statusText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    letterSpacing: "1.5px",
    color: "#38bdf8",
  },
  muteBtn: {
    background: "transparent",
    border: "none",
    fontSize: "13px",
    marginLeft: "6px",
    cursor: "pointer",
    lineHeight: 1,
    opacity: 0.85,
  },
  sliderDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.1)",
    margin: "2px 0",
  },
  sliderRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  sliderLabel: {
    fontFamily: "'Sora', sans-serif",
    fontSize: "12px",
    fontWeight: 500,
    color: "#E0F2FE",
    letterSpacing: "0.3px",
  },
  slider: {
    width: "100%",
    height: "10px",
    cursor: "pointer",
    accentColor: "#00f0ff",
  },
  termOuter: {
    flex: 1,
    minHeight: 0,
    margin: "4px 18px 10px",
    background: "#02233f",
    clipPath:
      "polygon(0 10%, 8% 0, 100% 0, 100% 90%, 92% 100%, 0 100%)",
    padding: "2px",
    boxShadow: "0 0 22px rgba(0,240,255,0.3)",
  },
  termInner: {
    height: "100%",
    overflowY: "auto",
    background: "rgba(0,240,255,0.08)",
    clipPath:
      "polygon(0 10%, 8% 0, 100% 0, 100% 90%, 92% 100%, 0 100%)",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  termLine: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  termPrefix: {
    color: "#00f0ff",
    fontWeight: 700,
    flexShrink: 0,
  },
  termText: {
    color: "#7dd3fc",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    textShadow: "0 0 6px rgba(0,240,255,0.4)",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 18px",
    borderTop: "1px solid #00f0ff",
    background: "#030712",
  },
  prompt: {
    fontFamily: "'JetBrains Mono', monospace",
    color: "#00f0ff",
    fontSize: "14px",
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#E0F2FE",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "13px",
  },
  sendBtn: {
    background: "transparent",
    border: "1px solid #00f0ff",
    color: "#00f0ff",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    letterSpacing: "1.5px",
    padding: "7px 12px",
    borderRadius: "6px",
  },
  micBtn: {
    background: "transparent",
    border: "1px solid #00f0ff",
    fontSize: "12px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};

export { Jarvis as App };
export default Jarvis;