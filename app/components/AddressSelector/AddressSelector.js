"use client";

import React, { useState } from "react";
import AddressSelectorStyles from "./AddressSelector.styled";
import { recipientAddresses } from "../../data/addresses";

export default function AddressSelector({ onAddressChange }) {
  const [selectedId, setSelectedId] = useState("usa");
  const [customAddress, setCustomAddress] = useState({
    name: "",
    company: "",
    address1: "",
    address2: "",
    postalCode: "",
    city: "",
    state: "",
    countryCode: "",
    country: "",
    phone: "",
    email: ""
  });

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);

    if (id === "other") {
      onAddressChange(customAddress);
    } else {
      const address = recipientAddresses.find((addr) => addr.id === id);
      onAddressChange(address);
    }
  };

  const handleCustomFieldChange = (field, value) => {
    const updated = { ...customAddress, [field]: value };
    setCustomAddress(updated);
    if (selectedId === "other") {
      onAddressChange(updated);
    }
  };

  return (
    <AddressSelectorStyles>
      <h2>Recipient Address</h2>

      <div className="field">
        <label htmlFor="address-select">Select Address</label>
        <select
          id="address-select"
          value={selectedId}
          onChange={handleSelectChange}
        >
          {recipientAddresses.map((addr) => (
            <option key={addr.id} value={addr.id}>
              {addr.label}
            </option>
          ))}
        </select>
      </div>

      {selectedId === "other" && (
        <div className="custom-fields">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={customAddress.name}
              onChange={(e) => handleCustomFieldChange("name", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="company">Company</label>
            <input
              id="company"
              type="text"
              value={customAddress.company}
              onChange={(e) =>
                handleCustomFieldChange("company", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="address1">Address Line 1</label>
            <input
              id="address1"
              type="text"
              value={customAddress.address1}
              onChange={(e) =>
                handleCustomFieldChange("address1", e.target.value)
              }
            />
          </div>

          <div className="field">
            <label htmlFor="address2">Address Line 2</label>
            <input
              id="address2"
              type="text"
              value={customAddress.address2}
              onChange={(e) =>
                handleCustomFieldChange("address2", e.target.value)
              }
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                type="text"
                value={customAddress.postalCode}
                onChange={(e) =>
                  handleCustomFieldChange("postalCode", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                value={customAddress.city}
                onChange={(e) => handleCustomFieldChange("city", e.target.value)}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="state">State</label>
              <input
                id="state"
                type="text"
                value={customAddress.state}
                onChange={(e) =>
                  handleCustomFieldChange("state", e.target.value)
                }
              />
            </div>

            <div className="field">
              <label htmlFor="countryCode">Country Code</label>
              <input
                id="countryCode"
                type="text"
                value={customAddress.countryCode}
                onChange={(e) =>
                  handleCustomFieldChange("countryCode", e.target.value)
                }
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="text"
              value={customAddress.phone}
              onChange={(e) => handleCustomFieldChange("phone", e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={customAddress.email}
              onChange={(e) => handleCustomFieldChange("email", e.target.value)}
            />
          </div>
        </div>
      )}
    </AddressSelectorStyles>
  );
}
