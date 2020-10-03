import React, { useState, useRef } from "react"
import Img from "gatsby-image"

import Layout from "../components/Layout"
import { requestCommission } from "../../client"
import { getFileAsBase64String } from "../helpers/img"

const emptyContactDetails = {
  name: "",
  phone: "",
  email: "",
  preferredContact: "email",
  details: "",
  canvas: "12x12 canvas",
}

const estimatedPriceBasedOnSize = {
  "12x12 canvas": 0,
  "11x14 canvas": 0,
  "12x16 canvas": 0,
  "16x16 canvas": 0,
  "14x18 canvas": 0,
  "20x20 canvas": 0,
  "18x24 canvas": 0,
  "24x24 canvas": 0,
  "30x24 canvas": 0,
  "36x36 canvas": 0,
  "30x40 canvas": 0,
  "24x36 canvas": 0,
  "12x16 paper": 0,
  Other: 0,
}

export default ({}) => {
  const [values, setValues] = useState(emptyContactDetails)
  const [requestStatus, setRequestStatus] = useState("pristine")
  const form = useRef(null)
  const file = useRef(null)
  const handleUpdate = (e, field) => {
    e.persist()
    setValues({
      ...values,
      [field]: field === "file" ? e.target.file : e.target.value,
    })
  }

  const submit = async () => {
    setRequestStatus("loading")
    const uploadedFileAsString = file.current
      ? await getFileAsBase64String(file.current.files[0])
      : null

    requestCommission({
      ...values,
      attachment: uploadedFileAsString
        ? {
            content: uploadedFileAsString,
            name: file.current.files[0].name
              .split("")
              .filter(char => char !== " ")
              .join(""),
            type: file.current.files[0].type,
          }
        : null,
    })
      .then(res => {
        console.info("Commission Request Response", res)
        setRequestStatus("success")
      })
      .catch(e => {
        console.error("Commission Request Response", e)
        setRequestStatus("error")
      })
  }

  const isDisabled =
    !values.name ||
    (values.preferredContact === "email" && !values.email) ||
    (values.preferredContact === "phone" && !values.phone) ||
    requestStatus === "loading"

  return (
    <>
      <form ref={form} className="flex-col-center w-full justify-center">
        <div className="flex flex-wrap w-full text-center justify-center">
          <legend className="w-full my-5">Contact Details:</legend>
          <label className="mr-5">Name:</label>
          <input
            name="name"
            type="text"
            value={values.name}
            onChange={e => handleUpdate(e, "name")}
          />
          <label className="mr-5">Phone Number:</label>
          <input
            name="phone"
            type="tel"
            value={values.phone}
            onChange={e => handleUpdate(e, "phone")}
          />
          <label className="mr-5">Email:</label>
          <input
            name="email"
            type="email"
            value={values.email}
            onChange={e => handleUpdate(e, "email")}
          />
          <label className="mr-5">Contact Preference:</label>
          <select
            id="canvas"
            name="preferredContact"
            value={values.preferredContact}
            onChange={e => handleUpdate(e, "preferredContact")}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>
        <div className="flex flex-wrap w-full justify-center">
          <legend className="w-full my-5 text-center">
            Details on your Piece:
          </legend>
          <label className="w-full text-center">Example Image:</label>
          <input ref={file} name="attachment" type="file" />
          <label className="w-full mt-5 text-center">
            Canvas Size and Type
          </label>
          <select
            name=""
            id="canvas"
            name="canvas"
            value={values.canvas}
            onChange={e => handleUpdate(e, "canvas")}
          >
            <option value="12x12 canvas">12x12 canvas</option>
            <option value="11x14 canvas">11x14 canvas</option>
            <option value="12x16 canvas">12x16 canvas</option>
            <option value="16x16 canvas">16x16 canvas</option>
            <option value="14x18 canvas">14x18 canvas</option>
            <option value="20x20 canvas">20x20 canvas</option>
            <option value="18x24 canvas">18x24 canvas</option>
            <option value="24x24 canvas">24x24 canvas</option>
            <option value="30x24 canvas">30x24 canvas</option>
            <option value="36x36 canvas">36x36 canvas</option>
            <option value="30x40 canvas">30x40 canvas</option>
            <option value="24x36 canvas">24x36 canvas</option>
            <option value="12x16 paper">12x16 paper</option>
            <option value="Other">Other Size</option>
          </select>
        </div>
        <label className="mt-5">Anything Else?</label>
        <textarea
          name="details"
          id=""
          cols="50"
          rows="10"
          maxLength="500"
          value={values.details}
          onChange={e => handleUpdate(e, "details")}
        />
      </form>
      <button
        disabled={isDisabled}
        onClick={submit}
        className={`${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        } border-black border p-4 m-5`}
      >
        Request my Commission!
      </button>
    </>
  )
}
