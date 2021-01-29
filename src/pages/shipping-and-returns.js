import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/Layout"
import SEO from "../components/SEO";

const description = "Claire is a fine artist residing in Charleston South Carolina. She specializes in oil painting. She is inspired by the masters.";

export default ({
    location
}) => {
  return (
    <SEO
        title={"Shipping + Return Policy"}
        pathname={location.pathname}
        description={description}>
        <Layout classNames="sqrl-grey p-10 mb-10" maxWidth="100rem" location={location}>
            <div className="text w-full flex flex-col m-5">
                <h2 className="mb-10 font-semibold tracking-wider w-full text-center text-xl">SHIPPING + RETURN POLICY</h2>
                <h3 className="w-full text-left font-semibold tracking-wider">ORDERING</h3>
                <p className="mb-10 my-2 sqrl-font-1">
                      Please review your order carefully before placing to prevent any  delays  on processing and shipping. Once your order is placed, you will receive an order confirmation email with your order summary.
                </p>
                <h3 className="w-full text-left font-semibold tracking-wider">SHIPPING INFORMATION</h3>
                  <p className="mb-10 my-2 sqrl-font-1">
                      <strong>All products purchased through ckendallart.com include free shipping</strong>. Once shipped, you will receive a shipment confirmation email with a tracking number. Currently, we only offer international shipping on our print orders.
                </p>
                <h4 className="font-semibold tracking-wider w-full text-left ml-5">ORIGINAL PAINTINGS + COMMISSIONS</h4>
                <p className="mb-10 my-2 sqrl-font-1 ml-5">
                      All original (non-print/reproduction) works are varnished and meticulously pre-packaged in Claire Kendall's studio in Charleston, SC before shipping. We use UPS for all shipping orders within the United States. All pieces are carefully packed and reinforced by UPS and <strong>insured for the full purchase price of the painting</strong>. Large paintings may be shipped in a wooden crate to ensure safe delivery. You can expect your order to ship within 3-7 days of your purchase date.
                </p>
                <h4 className="font-semibold tracking-wider w-full text-left ml-5">PRINTS</h4>
                <p className="mb-10 my-2 sqrl-font-1 ml-5">
                      Print orders are produced, warehoused and shipped via a third-party wholesaler. Please allow 2-7 business days for printing and an additional 3-7 business days for shipping. Print products ship to most international locations with the exception of Cuba, Crimea, Iran, North Korea, and Syria.
                </p>
                <h3 className="w-full text-left font-semibold tracking-wider">RETURNS</h3>
                <p className="mb-10 my-2 sqrl-font-1">
                      All original paintings, prints and commissions are final sale and cannot be returned or exchanged.
                </p>
                <h4 className="font-semibold tracking-wider w-full text-left ml-5">REFUND EXCEPTIONS</h4>
                <p className="mb-10 my-2 sqrl-font-1 ml-5">
                      Any  claims for misprinted/damaged/defective products must be  submitted within 10  days after the product has been received. Please take a hi-res photograph and email a description of the damage to <a href="mailto:info@ckendallart.com">info@ckendallart.com</a> for consideration. For packages lost in transit, all claims must be submitted no later than 4 weeks after  the  estimated delivery date. Valid claims will receive a refund or duplicate product from the responsible party.
                </p>
          </div>
        </Layout>
      </SEO>
  )
}
