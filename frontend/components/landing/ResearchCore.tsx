"use client";

import {
  Float,
} from "@react-three/drei";

import {
  useFrame,
} from "@react-three/fiber";

import {
  MutableRefObject,
  useMemo,
  useRef,
} from "react";

import * as THREE from "three";

type ResearchCoreProps = {
  position?: [
    number,
    number,
    number
  ];

  scrollProgress?:
    MutableRefObject<number>;

  storyMode?: boolean;
};

const nodes = [
  {
    position: [
      2.15,
      1.35,
      0.1,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.15,
  },

  {
    position: [
      2.25,
      -1,
      -0.35,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.11,
  },

  {
    position: [
      -2.05,
      1.2,
      -0.6,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.13,
  },

  {
    position: [
      -2.15,
      -1.1,
      0.4,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.1,
  },

  {
    position: [
      0.4,
      2.15,
      -0.8,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.09,
  },

  {
    position: [
      -0.45,
      -2,
      -0.7,
    ] as [
      number,
      number,
      number
    ],

    scale: 0.085,
  },
];

export default function ResearchCore({
  position = [
    1.8,
    0,
    0,
  ],

  scrollProgress,

  storyMode = false,
}: ResearchCoreProps) {
  const group =
    useRef<THREE.Group>(
      null
    );

  const ringOne =
    useRef<THREE.Mesh>(
      null
    );

  const ringTwo =
    useRef<THREE.Mesh>(
      null
    );

  const innerCore =
    useRef<THREE.Mesh>(
      null
    );

  // ==========================================================
  // PARTICLES
  // ==========================================================

  const particles =
    useMemo(() => {
      const count =
        storyMode
          ? 260
          : 380;

      const result =
        new Float32Array(
          count * 3
        );

      for (
        let index = 0;
        index < count;
        index++
      ) {
        const radius =
          THREE.MathUtils.randFloat(
            3.2,
            6.4
          );

        const theta =
          Math.random() *
          Math.PI *
          2;

        const phi =
          Math.acos(
            THREE.MathUtils.randFloatSpread(
              2
            )
          );

        result[
          index * 3
        ] =
          radius *
          Math.sin(phi) *
          Math.cos(theta);

        result[
          index * 3 + 1
        ] =
          radius *
          Math.sin(phi) *
          Math.sin(theta);

        result[
          index * 3 + 2
        ] =
          radius *
          Math.cos(phi);
      }

      return result;
    }, [
      storyMode,
    ]);

  // ==========================================================
  // ANIMATION
  // ==========================================================

  useFrame(
    (
      state,
      delta
    ) => {
      if (
        !group.current
      ) {
        return;
      }

      const elapsed =
        state.clock.elapsedTime;

      // ======================================================
      // HERO MODE
      // ======================================================

      if (
        !scrollProgress
      ) {
        group.current.rotation.y +=
          delta *
          0.06;

        group.current.rotation.x =
          THREE.MathUtils.lerp(
            group.current.rotation.x,
            state.pointer.y *
              0.12,
            0.045
          );

        group.current.rotation.z =
          THREE.MathUtils.lerp(
            group.current.rotation.z,
            -state.pointer.x *
              0.05,
            0.045
          );

        return;
      }

      // ======================================================
      // SAFE SCROLL MODE
      // ======================================================

      const progress =
        THREE.MathUtils.clamp(
          scrollProgress.current,
          0,
          1
        );

      /*
       * Keep every movement bounded.
       * Nothing can fly off screen.
       */

      const targetRotationY =
        progress *
        Math.PI *
        1.55;

      const targetRotationX =
        Math.sin(
          progress *
          Math.PI *
          2
        ) *
        0.18;

      const targetRotationZ =
        Math.sin(
          progress *
          Math.PI *
          1.5
        ) *
        0.08;

      const targetX =
        position[0] +
        Math.sin(
          progress *
          Math.PI *
          2
        ) *
          0.18;

      const targetY =
        position[1] +
        Math.sin(
          progress *
          Math.PI
        ) *
          -0.12;

      const targetScale =
        0.95 +
        Math.sin(
          progress *
          Math.PI
        ) *
          0.12;

      /*
       * Higher lerp value =
       * less delayed drift after stopping.
       */

      const follow =
        0.22;

      group.current.rotation.y =
        THREE.MathUtils.lerp(
          group.current.rotation.y,
          targetRotationY,
          follow
        );

      group.current.rotation.x =
        THREE.MathUtils.lerp(
          group.current.rotation.x,
          targetRotationX,
          follow
        );

      group.current.rotation.z =
        THREE.MathUtils.lerp(
          group.current.rotation.z,
          targetRotationZ,
          follow
        );

      group.current.position.x =
        THREE.MathUtils.lerp(
          group.current.position.x,
          targetX,
          follow
        );

      group.current.position.y =
        THREE.MathUtils.lerp(
          group.current.position.y,
          targetY,
          follow
        );

      const scale =
        THREE.MathUtils.lerp(
          group.current.scale.x,
          targetScale,
          follow
        );

      group.current.scale.setScalar(
        scale
      );

      // ======================================================
      // RING MOTION
      // ======================================================

      if (
        ringOne.current
      ) {
        ringOne.current.rotation.z =
          progress *
          Math.PI *
          3.2 +
          elapsed *
          0.04;
      }

      if (
        ringTwo.current
      ) {
        ringTwo.current.rotation.z =
          -progress *
          Math.PI *
          2.6 -
          elapsed *
          0.025;
      }

      // ======================================================
      // INNER CORE LIFE
      // ======================================================

      if (
        innerCore.current
      ) {
        innerCore.current.rotation.x =
          elapsed *
          0.08;

        innerCore.current.rotation.y =
          -elapsed *
          0.11;
      }
    }
  );

  return (
    <>
      {/* PARTICLES */}

      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              particles,
              3,
            ]}
          />
        </bufferGeometry>

        <pointsMaterial
          size={0.02}
          color="#ffffff"
          transparent
          opacity={
            storyMode
              ? 0.1
              : 0.18
          }
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* MAIN SYSTEM */}

      <group
        ref={group}
        position={position}
      >
        {/* RING 01 */}

        <mesh
          ref={ringOne}
          rotation={[
            Math.PI /
              2.4,
            0.2,
            0.3,
          ]}
        >
          <torusGeometry
            args={[
              2.05,
              0.008,
              12,
              100,
            ]}
          />

          <meshBasicMaterial
            color="#67e8f9"
            transparent
            opacity={0.16}
            depthWrite={false}
          />
        </mesh>

        {/* RING 02 */}

        <mesh
          ref={ringTwo}
          rotation={[
            -0.3,
            Math.PI /
              2.4,
            0.5,
          ]}
        >
          <torusGeometry
            args={[
              1.58,
              0.006,
              12,
              90,
            ]}
          />

          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.06}
            depthWrite={false}
          />
        </mesh>

        {/* CENTRAL CORE */}

        <Float
          speed={
            storyMode
              ? 0.35
              : 1
          }
          rotationIntensity={
            storyMode
              ? 0.02
              : 0.14
          }
          floatIntensity={
            storyMode
              ? 0.025
              : 0.12
          }
        >
          <mesh>
            <icosahedronGeometry
              args={[
                1.08,
                3,
              ]}
            />

            <meshPhysicalMaterial
              color="#111417"
              roughness={0.22}
              metalness={0.76}
              clearcoat={0.75}
              clearcoatRoughness={0.18}
            />
          </mesh>

          {/* WIREFRAME */}

          <mesh
            ref={innerCore}
            scale={0.72}
          >
            <icosahedronGeometry
              args={[
                1,
                2,
              ]}
            />

            <meshBasicMaterial
              color="#67e8f9"
              transparent
              opacity={0.06}
              wireframe
              depthWrite={false}
            />
          </mesh>

          {/* ENERGY */}

          <mesh
            scale={0.28}
          >
            <icosahedronGeometry
              args={[
                1,
                1,
              ]}
            />

            <meshBasicMaterial
              color="#67e8f9"
              transparent
              opacity={0.68}
            />
          </mesh>

          <pointLight
            intensity={11}
            distance={4.2}
            color="#67e8f9"
          />
        </Float>

        {/* NODES */}

        {nodes.map(
          (
            node,
            index
          ) => (
            <AgentNode
              key={index}
              position={
                node.position
              }
              scale={
                node.scale
              }
              delay={
                index *
                0.35
              }
            />
          )
        )}
      </group>
    </>
  );
}

// ============================================================
// NODE
// ============================================================

function AgentNode({
  position,
  scale,
  delay,
}: {
  position: [
    number,
    number,
    number
  ];

  scale: number;

  delay: number;
}) {
  const ref =
    useRef<THREE.Mesh>(
      null
    );

  useFrame(
    (
      state
    ) => {
      if (
        !ref.current
      ) {
        return;
      }

      const pulse =
        1 +
        Math.sin(
          state.clock.elapsedTime *
            1.2 +
            delay
        ) *
          0.055;

      ref.current.scale.setScalar(
        scale *
          pulse
      );
    }
  );

  return (
    <mesh
      ref={ref}
      position={position}
    >
      <sphereGeometry
        args={[
          1,
          14,
          14,
        ]}
      />

      <meshStandardMaterial
        color="#b8f4fb"
        emissive="#22d3ee"
        emissiveIntensity={0.38}
        roughness={0.32}
        metalness={0.12}
      />
    </mesh>
  );
}