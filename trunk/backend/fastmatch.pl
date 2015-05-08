#! /usr/bin/perl

use HTTP::Request;
use LWP::UserAgent;

my $json = '{"description":"FastMatch Division","judges":5,"current":0,"form":0,"order":{"finals":[0,1,2]},"forms":{"finals":[{"name":"Taegeuk 7"},{"name":"Keumgang"}]},"athletes":["Piper","Anika","Saahitya"]}';
my $ua   = new LWP::UserAgent();
my $req  = new HTTP::Request( 'POST', 'http://freescore.net:3088/freescore/1/fastmatch' );
$req->header( 'Content-Type' => 'application/json' );
$req->content( $json );

my $response = $ua->request( $req );
if( $response->is_success ) {
	print $response->decoded_content;
}
