export const validateTitle = (value: string | undefined): string => {
  if (!value || value.length < 4 || value.length > 64) {
    return 'Title must be between 4 and 64 characters'
  } else {
    return ''
  }
}

export const validateDesc = (value: string): string => {
  if (value.length < 4 || value.length > 1024) {
    return 'Description must be between 4 and 1024 characters'
  } else {
    return ''
  }
}

export const validateLink = (value: string | undefined): string => {
  if (value && (value.length < 12 || value.length > 128)) {
    return 'Discussion link must be between 12 and 128 characters'
  } else if (value && !value.startsWith('https')) {
    return "Discussion link must start with 'https'"
  } else if (value && !validateUrl(value)) {
    return 'Please input a valid url'
  } else {
    return ''
  }
}

const validateUrl = (value: string) => {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value,
  )
}

export const validateContractAddress = (value: string | undefined): string => {
  if (!value) {
    return 'Requires a target contract address of format cosmwasm_std::HumanAddr'
  } else {
    return ''
  }
}

export const validateContractMsg = (value: string | undefined): string => {
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
  if (!value) {
    return 'Requires a binary message to execute'
  } else if (!base64regex.test(value)) {
    return 'Binary message is not valid base 64 format'
  } else {
    return ''
  }
}
/**
 * Checks whether the errors object contains any errors
 * @param errors - The object with the possible errors as keys and validations as values
 * @return {boolean} Whether the errors object has any errors
 */

export const hasError = (errors: FieldsErrors): boolean => {
  return Object.values(errors).some((value) => value.hasError)
}
