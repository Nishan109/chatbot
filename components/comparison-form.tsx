"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Minus, Save } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ComparisonTable } from "./comparison-table"

interface Feature {
  name: string
  values: { [key: string]: string }
}

export function ComparisonForm() {
  const [title, setTitle] = React.useState("Product Comparison")
  const [products, setProducts] = React.useState<string[]>(["Product 1", "Product 2"])
  const [features, setFeatures] = React.useState<Feature[]>([
    { name: "Feature 1", values: { "Product 1": "", "Product 2": "" } },
  ])
  const [isTableGenerated, setIsTableGenerated] = React.useState(false)

  const addProduct = () => {
    const newProductName = `Product ${products.length + 1}`
    setProducts([...products, newProductName])
    setFeatures(
      features.map((feature) => ({
        ...feature,
        values: { ...feature.values, [newProductName]: "" },
      })),
    )
  }

  const removeProduct = (index: number) => {
    if (products.length <= 2) return // Maintain minimum 2 products
    const updatedProducts = products.filter((_, i) => i !== index)
    const productToRemove = products[index]
    setProducts(updatedProducts)
    setFeatures(
      features.map((feature) => {
        const newValues = { ...feature.values }
        delete newValues[productToRemove]
        return { ...feature, values: newValues }
      }),
    )
  }

  const addFeature = () => {
    setFeatures([
      ...features,
      {
        name: `Feature ${features.length + 1}`,
        values: Object.fromEntries(products.map((p) => [p, ""])),
      },
    ])
  }

  const removeFeature = (index: number) => {
    if (features.length <= 1) return // Maintain minimum 1 feature
    setFeatures(features.filter((_, i) => i !== index))
  }

  const updateFeatureName = (index: number, name: string) => {
    const updatedFeatures = [...features]
    updatedFeatures[index].name = name
    setFeatures(updatedFeatures)
  }

  const updateFeatureValue = (featureIndex: number, product: string, value: string) => {
    const updatedFeatures = [...features]
    updatedFeatures[featureIndex].values[product] = value
    setFeatures(updatedFeatures)
  }

  const generateTable = () => {
    setIsTableGenerated(true)
  }

  const formatDataForTable = () => {
    return features.map((feature) => ({
      feature: feature.name,
      ...feature.values,
    }))
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Comparison Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="title">Table Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter table title"
              />
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Products</Label>
                <Button onClick={addProduct} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>
              <div className="grid gap-4">
                {products.map((product, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={product}
                      onChange={(e) => {
                        const newProducts = [...products]
                        const oldProduct = newProducts[index]
                        newProducts[index] = e.target.value
                        setProducts(newProducts)
                        // Update feature values with new product name
                        setFeatures(
                          features.map((feature) => {
                            const newValues = { ...feature.values }
                            newValues[e.target.value] = newValues[oldProduct]
                            delete newValues[oldProduct]
                            return { ...feature, values: newValues }
                          }),
                        )
                      }}
                      placeholder="Product name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(index)}
                      disabled={products.length <= 2}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Features</Label>
                <Button onClick={addFeature} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Feature
                </Button>
              </div>
              <div className="grid gap-6">
                {features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        value={feature.name}
                        onChange={(e) => updateFeatureName(featureIndex, e.target.value)}
                        placeholder="Feature name"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFeature(featureIndex)}
                        disabled={features.length <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 pl-4">
                      {products.map((product) => (
                        <div key={product} className="grid grid-cols-2 gap-2 items-center">
                          <Label>{product}</Label>
                          <Input
                            value={feature.values[product]}
                            onChange={(e) => updateFeatureValue(featureIndex, product, e.target.value)}
                            placeholder="Value"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={generateTable} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Generate Table
            </Button>
          </div>
        </CardContent>
      </Card>

      {isTableGenerated && (
        <ComparisonTable title={title} data={formatDataForTable()} products={products} className="mt-8" />
      )}
    </div>
  )
}
