// the School type to represent the list of schools
export type School = {
  id: number
  name: string
  description: string
}
//The InputCreateSchool type is the body of our JSON when we have to send this body through a form to the backend
export type InputCreateSchool = {
  id: number
  name: string
  description: string
}

// the InputUpdateSchool type to represent the body of our form when we have to update the school information.
export type InputUpdateSchool = {
  id: number
  description: string
}
