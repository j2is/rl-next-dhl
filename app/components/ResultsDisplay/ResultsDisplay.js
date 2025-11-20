"use client";

import React, { useState } from "react";
import ResultsDisplayStyles from "./ResultsDisplay.styled";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function ResultsDisplay({ results, requestData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!results) return null;

  return (
    <ResultsDisplayStyles>
      <h2>Shipping Cost Breakdown</h2>

      {results.products && results.products.length > 0 ? (
        <div className="results-content">
          {results.products.map((product, index) => (
            <div key={index} className="product-result">
              <h3>Service: {product.productName || "Standard Shipping"}</h3>

              {product.totalPrice && (
                <div className="price-summary">
                  <div className="price-row total">
                    <span>Total Cost:</span>
                    <span>
                      {product.totalPrice[0]?.price || "N/A"}{" "}
                      {product.totalPrice[0]?.currencyType || ""}
                    </span>
                  </div>
                </div>
              )}

              {product.breakdown && product.breakdown.length > 0 && (
                <div className="breakdown">
                  <h4>Cost Breakdown:</h4>
                  {product.breakdown.map((item, i) => (
                    <div key={i} className="price-row">
                      <span>{item.name || item.type}:</span>
                      <span>
                        {item.price || item.amount || "N/A"}{" "}
                        {item.currencyType || item.currency || ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {product.detailedPriceBreakdown && (
                <div className="breakdown">
                  <h4>Detailed Breakdown:</h4>
                  {product.detailedPriceBreakdown.map((item, i) => (
                    <div key={i} className="price-section">
                      <div className="price-row">
                        <span>{item.breakdown?.[0]?.name || "Item"}:</span>
                        <span>
                          {item.breakdown?.[0]?.price || "N/A"}{" "}
                          {item.currencyType || ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No rates available for this shipment.</p>
        </div>
      )}

      <div className="accordion">
        <button
          className="accordion-header"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>View Raw Data</span>
          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </button>
        {isExpanded && (
          <div className="accordion-content">
            <h4>Request Data:</h4>
            <pre>{JSON.stringify(requestData, null, 2)}</pre>
            <h4>Response Data:</h4>
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        )}
      </div>
    </ResultsDisplayStyles>
  );
}
