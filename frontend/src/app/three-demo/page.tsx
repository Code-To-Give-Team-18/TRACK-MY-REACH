import Scene from '@/components/three/Scene';

export default function ThreeDemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Three.js Demo with Next.js
        </h1>
        <div className="bg-black/20 rounded-lg p-4 backdrop-blur-sm">
          <Scene />
        </div>
        <div className="mt-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Interactive 3D Scene</h2>
          <p className="text-gray-300">
            Click on the orange box to scale it. Hover over objects to see color changes.
          </p>
          <p className="text-gray-300 mt-2">
            Use your mouse to orbit around the scene (click and drag).
          </p>
        </div>
      </div>
    </main>
  );
}