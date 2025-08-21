import { Button } from '@/components/ui/button';

export default function TestTailwindPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Tailwind CSS is Working! 🎨
        </h1>
        
        <div className="max-w-4xl mx-auto">
          {/* Card Example */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Component Examples
            </h2>
            
            {/* Buttons */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-600">
                  Button Variants
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2 text-gray-600">
                  Button Sizes
                </h3>
                <div className="flex items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid Example */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-red-100 p-4 rounded-lg text-center">
              <p className="text-red-800 font-semibold">Red Box</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <p className="text-green-800 font-semibold">Green Box</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <p className="text-blue-800 font-semibold">Blue Box</p>
            </div>
          </div>
          
          {/* Flexbox Example */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Flexbox Layout
            </h3>
            <div className="flex justify-between items-center">
              <div className="bg-purple-500 text-white px-4 py-2 rounded">Left</div>
              <div className="bg-indigo-500 text-white px-4 py-2 rounded">Center</div>
              <div className="bg-pink-500 text-white px-4 py-2 rounded">Right</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}