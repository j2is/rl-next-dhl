"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "sonner";
import AddressSelector from "./components/AddressSelector/AddressSelector";
import ProductCatalog from "./components/ProductCatalog/ProductCatalog";
import ResultsDisplay from "./components/ResultsDisplay/ResultsDisplay";
import { senderAddress, recipientAddresses } from "./data/addresses";
import { assignPackages, groupByPackage, buildDHLRequest } from "./utils/packageAssignment";
import media from "./lib/media";
import CalculateIcon from "@mui/icons-material/Calculate";

const PageStyles = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;

  ${media.tabletPortraitAndBelow`
    padding: 20px 15px;
  `}

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 30px;
    text-align: center;
  }

  .sender-info {
    padding: 20px;
    background: #f5f5f5;
    border: 1px solid #000;
    margin-bottom: 30px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .sender-info h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .sender-info p {
    margin: 5px 0;
    font-size: 14px;
  }

  .calculate-button {
    width: 100%;
    padding: 15px;
    background: #000;
    color: #fff;
    border: none;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;

    ${media.hoverOnly`
      &:hover {
        background: #333;
      }
    `}

    &:disabled {
      background: #999;
      cursor: not-allowed;
    }
  }

  .package-summary {
    padding: 20px;
    border: 1px solid #000;
    margin-bottom: 30px;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-summary h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 15px;
  }

  .package-item {
    padding: 10px 0;
    border-bottom: 1px solid #000;

    ${media.minDevicePixelRatio2`
      border-width: 0.5px;
    `}
  }

  .package-item:last-child {
    border-bottom: none;
  }

  .package-name {
    font-weight: 700;
    margin-bottom: 5px;
  }

  .loading {
    text-align: center;
    padding: 30px;
  }
`;

export default function Home() {
  const [recipientAddress, setRecipientAddress] = useState(recipientAddresses[0]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [results, setResults] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (!recipientAddress.countryCode) {
      toast.error("Please select a valid recipient address");
      return;
    }

    setLoading(true);
    setResults(null);
    setRequestData(null);

    try {
      const assignments = assignPackages(selectedProducts);
      const groupedPackages = groupByPackage(assignments);
      const dhlRequest = buildDHLRequest(senderAddress, recipientAddress, groupedPackages);

      setRequestData(dhlRequest);

      const response = await fetch("/api/dhl-rates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dhlRequest),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to calculate rates");
        console.error("API Error:", data);
      } else {
        setResults(data);
        toast.success("Rates calculated successfully");
      }
    } catch (error) {
      console.error("Calculate Error:", error);
      toast.error("An error occurred while calculating rates");
    } finally {
      setLoading(false);
    }
  };

  const assignments = selectedProducts.length > 0 ? assignPackages(selectedProducts) : [];
  const groupedPackages = selectedProducts.length > 0 ? groupByPackage(assignments) : [];

  return (
    <PageStyles>
      <h1>DHL Landed Cost Calculator | Ratsey & Lapthorn</h1>

      <div className="sender-info">
        <h2>Sender Information</h2>
        <p><strong>{senderAddress.company}</strong></p>
        <p>{senderAddress.address1}</p>
        <p>{senderAddress.address2}</p>
        <p>{senderAddress.postalCode} {senderAddress.city}</p>
        <p>{senderAddress.country}</p>
        <p>{senderAddress.email}</p>
        <p>{senderAddress.phone}</p>
      </div>

      <AddressSelector onAddressChange={setRecipientAddress} />

      <ProductCatalog onSelectionChange={setSelectedProducts} />

      {groupedPackages.length > 0 && (
        <div className="package-summary">
          <h2>Package Assignment</h2>
          {groupedPackages.map((pkg, index) => (
            <div key={index} className="package-item">
              <div className="package-name">
                {pkg.package.name} ({pkg.items.length} items)
              </div>
              <div>
                Dimensions: {pkg.package.length} x {pkg.package.width} x {pkg.package.height} cm
              </div>
              <div>Total Weight: {pkg.totalWeight.toFixed(2)} kg</div>
            </div>
          ))}
        </div>
      )}

      <button
        className="calculate-button"
        onClick={handleCalculate}
        disabled={loading || selectedProducts.length === 0}
      >
        <CalculateIcon />
        {loading ? "Calculating..." : "Calculate Landed Cost"}
      </button>

      {loading && <div className="loading">Calculating rates...</div>}

      {results && <ResultsDisplay results={results} requestData={requestData} />}
    </PageStyles>
  );
}
