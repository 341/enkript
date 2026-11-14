Pod::Spec.new do |s|
  s.name           = 'VaultAutofill'
  s.version        = '1.0.0'
  s.summary        = 'Local vault autofill module'
  s.description    = 'Registers autofill credentials for my-enkript'
  s.license        = 'MIT'
  s.author         = 'enkript'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift}'
end
