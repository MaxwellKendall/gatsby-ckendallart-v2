import React, { useState, useRef } from "react"
import Img from "gatsby-image"

import Layout from "../components/Layout"
import { requestCommission } from "../../client"
import { getFileAsBase64String } from "../helpers/img"

const placeHolderByFieldName = {
  name: "YOUR NAME",
  phone: "PHONE # (optional)",
  email: "EMAIL ADDRESS",
  preferredContact: "email",
  details: "",
  canvas: "12x12 canvas",
  budget: 'BUDGET (optional)'
}

const emptyFormState = {
  name: "",
  phone: "",
  email: "",
  preferredContact: "email",
  details: "",
  canvas: "12x12 canvas",
  budget: ""
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
  const [values, setValues] = useState(emptyFormState)
  const [requestStatus, setRequestStatus] = useState("pristine")
  const form = useRef(null)
  const file = useRef(null)
  const handleUpdate = (e, field) => {
    e.persist();
    if (field === 'file') {
      setValues({
        ...values,
        [field]: e.target.file
      })  
    }
    else {
      setValues({
        ...values,
        [field]: e.target.value === ''
          ? emptyFormState[field]
          : e.target.value,
      })
    }
  }

  const submit = async () => {
    setRequestStatus("loading")
    const uploadedFileAsString = file.current
      ? await getFileAsBase64String(file.current.files[0])
      : null

    requestCommission({
      ...values,
      details: values.budget
        ? `Budget: ${values.budget}; ${values.details}`
        : values.details,
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
    <div className="commission-form flex flex-col justify-center items-center w-full">
      <form ref={form} className="flex-col-center justify-center md:w-3/4 xl:w-1/3">
        <div className="flex flex-wrap w-full pt-12 pb-4 text-center justify-center md:justify-start">
          <input
            className="mr-2 mr-100 border-b-2 bg-transparent text-black border-solid border-black"
            name="name"
            type="text"
            value={values.name}
            placeholder={placeHolderByFieldName.name}
            onChange={e => handleUpdate(e, "name")}
          />
          <div className="w-full py-8 flex justify-center md:justify-start">
            <input
                className="mr-2 border-b-2 bg-transparent text-black border-solid border-black md:self-start"
                name="email"
                type="email"
                value={values.email}
                placeholder={placeHolderByFieldName.email}
                onChange={e => handleUpdate(e, "email")} />
            <input
              className="mr-2 border-b-2 bg-transparent text-black border-solid border-black md:self-end md:ml-auto"
              name="phone"
              type="tel"
              value={values.phone}
              placeholder={placeHolderByFieldName.phone}
              onChange={e => handleUpdate(e, "phone")}
            />
          </div>
          <legend className="mr-2  border-b-2 bg-transparent text-black border-solid border-black" htmlFor="canvas">PREFERRED MODE OF CONTACT:</legend>
          <label className="my-auto mr-2" htmlFor="preferredContact1">EMAIL</label>
          <input
            className="my-auto"
            id="preferredContact1"
            type="radio"
            name="preferredContact"
            checked={values.preferredContact === 'email'}
            value="email"
            onChange={e => handleUpdate(e, "preferredContact")} />
          <label className="my-auto mr-2 ml-4" htmlFor="preferredContact2">PHONE</label>
          <input
            className="my-auto"
            id="preferredContact2"
            type="radio"
            name="preferredContact"
            checked={values.preferredContact === 'phone'}
            value="phone"
            onChange={e => handleUpdate(e, "preferredContact")} />
            <div className="pt-8 pb-2 w-full flex">
              <input
                className="mr-2 border-b-2 bg-transparent text-black border-solid border-black md:justify-self-start"
                name="name"
                type="text"
                value={values.name}
                placeholder={placeHolderByFieldName.budget}
                onChange={e => handleUpdate(e, "name")}
              />
              {/* <label className="py-4 flex md:self-start" htmlFor="">Canvas Size and Type</label> */}
            <select
              className="ml-auto bg-transparent"
              id="canvas"
              name="canvas"
              value={values.canvas}
              placeholder={placeHolderByFieldName.canvas}
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
        </div>
        <div className="flex flex-wrap w-full justify-center">
          <input
            className="mr-2 flex md:self-start bg-transparent text-black w-full border-0"
            ref={file}
            name="attachment"
            type="file" />
        </div>
        <h3 className="py-4 tracking-widest w-full">TELL ME MORE:</h3>
        <textarea
          className="w-full border-solid border-black border-2"
          name="details"
          id=""
          cols="50"
          rows="10"
          maxLength="500"
          value={values.details}
          placeholder={placeHolderByFieldName.details}
          onChange={e => handleUpdate(e, "details")}
        />
      </form>
      <button
        disabled={isDisabled}
        onClick={submit}
        className={`${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        } py-4 px-6 m-5 tracking-widest text-xl text-white sqrl-purple`}
      >
        SUBMIT
      </button>
    </div>
  )
}
