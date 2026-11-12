require 'xcodeproj'
require 'fileutils'
require 'tmpdir'

output = File.expand_path(ARGV[0] || File.join(Dir.tmpdir, 'heaven-hell-native-checks'))
FileUtils.mkdir_p(output)
project = Xcodeproj::Project.new(File.join(output, 'NativeChecks.xcodeproj'))
target = project.new_target(:ui_test_bundle, 'NativeChecks', :ios, '16.4')
source = project.main_group.new_file(File.expand_path('../tests/native/NativeChecks.swift', __dir__))
target.source_build_phase.add_file_reference(source)
target.build_configurations.each do |configuration|
  configuration.build_settings.merge!({
    'SWIFT_VERSION' => '5.0',
    'GENERATE_INFOPLIST_FILE' => 'YES',
    'PRODUCT_BUNDLE_IDENTIFIER' => 'com.heavenhell.nativechecks',
    'CODE_SIGNING_ALLOWED' => 'NO',
    'TARGETED_DEVICE_FAMILY' => '1,2'
  })
end
project.save
scheme = Xcodeproj::XCScheme.new
scheme.add_build_target(target)
scheme.add_test_target(target)
scheme.save_as(project.path, 'NativeChecks')
puts project.path
